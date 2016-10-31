1. Create API that does the following
  1. Create project POST /proyect
  2. Create build POST /build
  2. Create deploy POST /build
  4. What this route does:
     1. Stores data in in the database
2. POST create project
  1. Github repo (public)
  2. Dockerfile string
  3. Project Name
  4. Author ID
3. POST /build
  1. Project id
  2. What this does:
     1. Creates build using Docker
     2. Pushes image to registry
     2. Saves image with image name
4. POST /deploy
  1. Project ID
  2. Build ID
  2. Port
  3. What this does:
    1. Creates deployment in kubernetes
    2. Exposes port to public
    3. Saves deployment with deployment name
