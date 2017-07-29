#!/bin/sh

p=`lsb_release -i | grep -oE '[^[:space:]]+$' | tr '[:upper:]' '[:lower:]'`
pv=`lsb_release -r | grep -oE "[0-9\.]+"`
m=`uname -m`
channel='current'
product='chef'

echo "https://omnitruck.chef.io/$channel/$product/download?p=$p&pv=$pv&m=$m"