-- Drop the existing admin policy on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create separate policies for each operation with proper WITH CHECK for INSERT
CREATE POLICY "Admins can select all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));