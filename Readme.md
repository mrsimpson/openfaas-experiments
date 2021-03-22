# Motivation

This repo serves as living exploration for an architectural pattern: The *Functional Citadel*

There are a couple of movements in tech which all generate some kinds of benefits but at the same time introduce complexity compared to developing a  monolith.

As a long-time-host-systems-fat-monolith developer (SAP AS ABAP), I personally enjoy the comfort of running a (modular) monolith, yet I see its pitfalls with respect to scalability and potential for turning into a big ball of mud.

> The problem with prematurely turning your application into a range of services is chiefly that it violates the #1 rule of distribute computing: Don’t distribute your computing! At least if you can in any way avoid it.

> Every time you extract a collaboration between objects to a collaboration between systems, you’re accepting a world of hurt with a myriad of liabilities and failure states. What to do when services are down, how to migrate in concert, and all the pain of running many services in the first place.
[[DHH]](https://m.signalvnoise.com/the-majestic-monolith/)

I sort-of fell for [the citadel application architecture](https://blog.appsignal.com/2020/04/08/the-citadel-architecture-at-appsignal.html): Stick to the monolith, but if there are components which are loosely coupled from a business perspective, do so technically as well.

At the same time, we want systems to scale elastically and run resilient towards cloud-hardware-failure. Functions as a service are kind-of the extreme (in a positive way).

_This repo serves as evaluation of a pattern which combines a citadel, thought as the base for FaaS functions_

## Why, why would you want to do that?

A monolith (the citadel, given there are other very loosely related services around) is unbeaten with respect to testability and - and this is even more important to me - the ability to enforce consistency: No need for contract checks between microservices (the compiler does that) or constraints with respect to acessing each other's database (like updating data with it's associated entities in one transaction).

OpenFaaS establishes a standardized contract for functions via HTTP including dynamic scaling and in-build asynchronicity.

As the citadel will be implemented without any server session state, we'll be able to scale it inside wrapped functions, bringing all the sweetness of FaaS without increasing complexity.

# What's in

- The citadel: A simple CRUD-application (express) with multiple paths which
- some persistence
- an import function. Based on parameters it consumes either function and creates mass data. It utilizes the citadel as library (`import` it!)

# Setup

Based on [arkade](https://github.com/alexellis/arkade), as least effort as possible.

## Cluster

`ark get k3d`

and create a local K8S

```bash
k3d cluster create local \
--no-lb \
--volume ~/kubernetes/volumes/vol1:/var/k8s/vol1
```

with Dashboard
`ark get kubernetes-dashboard`
```
#To forward the dashboard to your local machine
kubectl proxy

#To get your Token for logging in
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user-token | awk '{print $1}')

# Once Proxying you can navigate to the below
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login
```

## Database

see [detailed instructions](./postgresql/Readme.md)

## OpenFaas

`ark install openfaas`

```
=======================================================================
= OpenFaaS has been installed.                                        =
=======================================================================

# Get the faas-cli
curl -SLsf https://cli.openfaas.com | sudo sh

# Forward the gateway to your machine
kubectl rollout status -n openfaas deploy/gateway
kubectl port-forward -n openfaas svc/gateway 8080:8080 &

# If basic auth is enabled, you can now log into your gateway:
PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)
echo -n $PASSWORD | faas-cli login --username admin --password-stdin

```

## Monitoring

Use the predefined Grafana

> OpenFaaS tracks metrics on your functions automatically using Prometheus. The metrics can be turned into a useful dashboard with free and Open Source tools like Grafana.
>
>Run Grafana in OpenFaaS Kubernetes namespace:
>
>
>``` 
> kubectl -n openfaas run \
>--image=stefanprodan/faas-grafana:4.6.3 \
>--port=3000 \
>grafana
>```
> Expose it:
>```
>kubectl port-forward pod/grafana 31113:3000 -n openfaas
>http://localhost:31113 "admin/admin
>```