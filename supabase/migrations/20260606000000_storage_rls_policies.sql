-- Storage RLS policies for project-files bucket
-- Path format: {projectId}/{uuid}-{originalFilename}

CREATE POLICY "Project members can view project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND (
    auth.uid() IN (
      SELECT freelancer_id
      FROM projects
      WHERE id::text = (storage.foldername(name))[1]
    )
    OR auth.uid() IN (
      SELECT client_id
      FROM project_clients
      WHERE project_id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Freelancers can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files'
  AND auth.uid() IN (
    SELECT freelancer_id
    FROM projects
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Freelancers can delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid() IN (
    SELECT freelancer_id
    FROM projects
    WHERE id::text = (storage.foldername(name))[1]
  )
);
