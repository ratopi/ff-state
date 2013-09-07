#!/bin/bash

# location of "master"
directoryURL="https://raw.github.com/freifunk/api.freifunk.net/master/directory/directory.json"

# go to "my" directory
cd "$( dirname "$0" )"

# load "master"
wget -O original.directory.json. "$directoryURL"  &&  mv original.directory.json. original.directory.json

# create local directory.json
echo "{" > directory.json.

# load state jsons
grep ':' original.directory.json | sed -e 's:" *,::' -e 's:"::g' -e 's+:+ +' | sort | while read id url; do

	wget -O "$id.json." "$url"  &&  mv "$id.json." "$id.json"

	echo '"'"$id"'": "'"data/$id.json"'",' >> directory.json.

done

echo '"":null}" >> directory.json.

mv directory.json. directory.json

