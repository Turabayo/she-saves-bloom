import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScheduledSaving {
  id: string;
  user_id: string;
  goal_id: string | null;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "one-time";
  next_execution_date: string;
  is_active: boolean;
  name: string;
  last_executed_at: string | null;
}

function getNextExecutionDate(frequency: string, currentDate: Date): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "one-time":
      return next;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    console.log(`[Auto Savings] Executing for date: ${todayStr}`);

    // Fetch all active scheduled savings due today or earlier
    const { data: dueRules, error: fetchError } = await supabase
      .from("scheduled_savings")
      .select("*")
      .eq("is_active", true)
      .lte("next_execution_date", todayStr);

    if (fetchError) {
      console.error("Error fetching scheduled savings:", fetchError);
      throw fetchError;
    }

    if (!dueRules || dueRules.length === 0) {
      console.log("[Auto Savings] No rules due for execution");
      return new Response(
        JSON.stringify({ success: true, message: "No rules due", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Auto Savings] Found ${dueRules.length} rules to execute`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const results: Array<{ rule_id: string; status: string; message: string }> = [];

    for (const rule of dueRules as ScheduledSaving[]) {
      try {
        console.log(`[Auto Savings] Processing rule: ${rule.name} (${rule.id})`);

        // IDEMPOTENCY CHECK: Skip if already executed today
        if (rule.last_executed_at) {
          const lastExec = new Date(rule.last_executed_at);
          if (isSameDay(lastExec, today)) {
            console.log(`[Auto Savings] Skipping rule ${rule.id} - already executed today`);
            skippedCount++;
            results.push({
              rule_id: rule.id,
              status: "skipped",
              message: "Already executed today",
            });
            continue;
          }
        }

        // Create a savings record
        const savingRecord = {
          user_id: rule.user_id,
          goal_id: rule.goal_id || null,
          amount: rule.amount,
          source: "auto_savings",
          type: "auto_savings",
          status: "success",
        };

        const { error: savingError } = await supabase
          .from("savings")
          .insert([savingRecord]);

        if (savingError) {
          console.error(`Error creating saving for rule ${rule.id}:`, savingError);
          errorCount++;
          results.push({
            rule_id: rule.id,
            status: "failed",
            message: savingError.message,
          });
          continue;
        }

        // Create a transaction record
        const transactionRecord = {
          user_id: rule.user_id,
          goal_id: rule.goal_id || null,
          amount: rule.amount,
          type: "auto_savings",
          method: "scheduled",
          status: "success",
        };

        await supabase.from("transactions").insert([transactionRecord]);

        // Calculate next execution date
        const nextDate = getNextExecutionDate(
          rule.frequency,
          new Date(rule.next_execution_date)
        );

        const now = new Date().toISOString();

        // Update the rule with last_executed_at for idempotency
        if (rule.frequency === "one-time") {
          await supabase
            .from("scheduled_savings")
            .update({
              is_active: false,
              last_executed_at: now,
              updated_at: now,
            })
            .eq("id", rule.id);
        } else {
          await supabase
            .from("scheduled_savings")
            .update({
              next_execution_date: nextDate.toISOString().split("T")[0],
              last_executed_at: now,
              updated_at: now,
            })
            .eq("id", rule.id);
        }

        successCount++;
        results.push({
          rule_id: rule.id,
          status: "success",
          message: `Saved ${rule.amount} RWF`,
        });

        console.log(
          `[Auto Savings] Successfully executed rule: ${rule.name}, amount: ${rule.amount}`
        );
      } catch (ruleError) {
        console.error(`Error processing rule ${rule.id}:`, ruleError);
        errorCount++;
        results.push({
          rule_id: rule.id,
          status: "failed",
          message: String(ruleError),
        });
      }
    }

    console.log(
      `[Auto Savings] Execution complete. Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${dueRules.length} rules`,
        processed: successCount,
        skipped: skippedCount,
        errors: errorCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in execute-auto-savings:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
