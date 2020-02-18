cd ./client/build/static/js
rm *.map
cd ../css
rm *.map
cd ../../../..
gcloud config set project bestroutes-481b2
gcloud app deploy --no-promote