# How I publish to snap store
## New way
Github action

### To get token for snapstore:
0. `docker compose build`
1. `docker compose up`
2. `docker compose exec web snapcraft export-login creds`
3. update ENV variable in Github with `creds`
4.  github action now can publish


## Old way
0. `docker-compose build`
1. Download snap from Github
2. `docker-compose up`
3. `docker-compose exec web snapcraft login`
4. `docker-compose exec web snapcraft upload --release=stable Stretchly_1.2.0_amd64.snap`
5. Or without `--release` and manage on website

### TODO
- script to do all steps?
- get rich?
