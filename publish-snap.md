# How I publish to snap store
## New way
Github action
## Old way
0. `docker-compose build`
1. Download snap from Github
2. `docker-compose up`
3. `docker-compose exec web snapcraft login`
4. `docker-compose exec web snapcraft upload --release=stable Stretchly_1.2.0_amd64.snap`
5. Or without `--release` and manage on website

### TODO
- build here not on GH?
- script to do all steps?
- get rich?
