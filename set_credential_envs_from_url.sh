#!/bin/bash
# Function that sets environement variables with the credentials of the given database url
#
# set_credential_envs_from_url <database_url> <env_prefix>
#
# Example:
#
#   set_credential_envs_from_url 'proto://user:pass@host:1234/db' 'DATABASE'
#
# Exports the following variabls
#
#   echo "$DATABASE_PROTO $DATABASE_user $DATABASE_pass $DATABASE_HOST $DATABASE_PORT $DATABASE_NAME
#
# Credits to Pjz https://stackoverflow.com/questions/6174220/parse-url-in-shell-script
#
# extract the protocol
prefix="cds_requires_postgres_credentials"
proto="`echo $DATABASE_URL | grep '://' | sed -e's,^\(.*://\).*,\1,g'`"
# remove the protocol
url=`echo $DATABASE_URL| sed -e s,$proto,,g`

# extract the user and password (if any)
userpass="`echo $url | grep @ | cut -d@ -f1`"
pass=`echo $userpass | grep : | cut -d: -f2`
# extract the host -- updated
hostport=`echo $url | sed -e s,$userpass@,,g | cut -d/ -f1`
port=`echo $hostport | grep : | cut -d: -f2`

if [ -n "$pass" ]; then
    user=`echo $userpass | grep : | cut -d: -f1`
else
    user=$userpass
fi

if [ -n "$port" ]; then
    host=`echo $hostport | grep : | cut -d: -f1`
else
    host=$hostport
fi

var_name_pass="$1_pass"
var_name_user="$1_user"
var_name_host="$1_host"
var_name_port="$1_port"
var_name_schema="$1_schema"
var_name_ssl="$1_ssl_rejectUnauthorized"

export $var_name_pass=`echo $pass | grep : | cut -d: -f2`
export $var_name_user=`echo $user | grep : | cut -d: -f2`
export $var_name_host=`echo $host | grep : | cut -d: -f2`
export $var_name_port=`echo $port | grep : | cut -d: -f2`
export $var_name_schema=public
export $var_name_ssl=false

echo "url: $url"
echo "proto: $proto"
echo "user: $var_name_user = $user"
echo "pass: $var_name_pass = $pass"
echo "host: $var_name_host = $host"
echo "port: $var_name_port = $port"
echo "schema: $var_name_schema = public"
echo "ssl: $var_name_ssl = false"