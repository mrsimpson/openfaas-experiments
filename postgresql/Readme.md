# Simple Postgresql setup
## Installation

In order to be able to `stop` our cluster (this includes also the metadata such as created databases and users), we shall provide a volume to the DB:

### Persistence

create a directory in the k3d docker container:
`docker exec k3d-local-server-0 sh -c "mkdir  -p /var/k8s/vol1"`

```bash

cat <<EOF | kubectl apply -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: local-storage
provisioner: manual/call-admin
parameters:
  type: nfs
reclaimPolicy: Retain
mountOptions:
EOF

cat << EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: vol1
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /var/k8s/vol1
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - k3d-local-server-0
EOF

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres
  namespace: default
spec:
  storageClassName: local-storage
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF
```

```bash
ark install  postgresql \
--set image.tag=11-debian-10 \
--set persistence.enabled=true \
--set persistence.existingClaim=postgres \
--set persistence.mountPath=/persistence \
--set postgresqlDataDir=/persistence/data/ \
--set volumePermissions.enabled=true \
--set volumePermissions.securityContext.runAsUser=1001 \
--set securityContext.fsGroup=0 \
--set shmVolume.chmod.enabled=false
```

```text
=======================================================================
= PostgreSQL has been installed.                                      =
=======================================================================

PostgreSQL can be accessed via port 5432 on the following DNS name from within your cluster:

	postgresql.default.svc.cluster.local - Read/Write connection

To get the password for "postgres" run:

    export POSTGRES_PASSWORD=$(kubectl get secret --namespace default postgresql -o jsonpath="{.data.postgresql-password}" | base64 --decode)

To connect to your database run the following command:

    kubectl run postgresql-client --rm --tty -i --restart='Never' --namespace default --image docker.io/bitnami/postgresql:11.6.0-debian-9-r0 --env="PGPASSWORD=$POSTGRES_PASSWORD" --command -- psql --host postgresql -U postgres -d postgres -p 5432

To connect to your database from outside the cluster execute the following commands:

    kubectl port-forward --namespace default svc/postgresql 5432:5432 &
	PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U postgres -d postgres -p 5432

# Find out more at: https://github.com/helm/charts/tree/master/stable/postgresql
```

## Create a user and DB
`PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5432 -U postgres`

```
CREATE ROLE curb WITH LOGIN PASSWORD 'curb'; 
ALTER ROLE curb CREATEDB;
```

`psql postgres -h localhost -p 5432 -U curb`

```
CREATE DATABASE curb;
GRANT ALL PRIVILEGES ON DATABASE curb TO curb;
```

## Enable PostGIS

Connect to your database with psql or PgAdmin. Run the following SQL. You need only install the features you want:

```
-- Enable PostGIS (as of 3.0 contains just geometry/geography)
CREATE EXTENSION postgis;
-- enable raster support (for 3+)
CREATE EXTENSION postgis_raster;
-- Enable Topology
CREATE EXTENSION postgis_topology;
-- Enable PostGIS Advanced 3D
-- and other geoprocessing algorithms
-- sfcgal not available with all distributions
CREATE EXTENSION postgis_sfcgal;
-- fuzzy matching needed for Tiger
CREATE EXTENSION fuzzystrmatch;
-- rule based standardizer
CREATE EXTENSION address_standardizer;
-- example rule data set
CREATE EXTENSION address_standardizer_data_us;
-- Enable US Tiger Geocoder
CREATE EXTENSION postgis_tiger_geocoder;
```
