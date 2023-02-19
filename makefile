include ../oidlib/config.make

dist_dir := dist
assets_dir := assets
atlas_assets_dir := $(assets_dir)/atlas
src_dir := src

atlas_in_files := $(wildcard $(atlas_assets_dir)/*.aseprite)
asset_files := \
  $(assets_dir)/atlas.json \
  $(assets_dir)/atlas.png \
  $(wildcard $(assets_dir)/index.*) \
  $(assets_dir)/manifest.json
dist_files := \
  $(asset_files:$(assets_dir)/%=$(dist_dir)/%) \
  $(dist_dir)/favicon.png \
  $(dist_dir)/favicon32x32.png \
  $(dist_dir)/favicon48x48.png \
  $(dist_dir)/favicon64x64.png \
  $(dist_dir)/favicon192x192.png \
  $(dist_dir)/favicon512x512.png

bundle_args ?=
test_unit_args ?=

.PHONY: build
build: bundle build-dist

.PHONY: build-dist
build-dist: $(dist_files)

.PHONY: watch-build
watch-build:; watchexec --ignore='*/$(dist_dir)/*' '$(make) build-dist'

.PHONY: watch
watch: watch-build watch-bundle serve

.PHONY: serve
serve: | $(dist_dir)/; $(live-server) '$(dist_dir)'

.PHONY: bundle
bundle: $(assets_dir)/atlas.json | $(dist_dir)/
  $(deno) bundle --config='$(deno_config)' src/index.ts '$(dist_dir)/super-patience.js' $(bundle_args)

.PHONY: watch-bundle
watch-bundle: bundle_args += --watch
watch-bundle: bundle

.PHONY: test
test: test-format test-lint build test-unit

.PHONY: test-format
test-format:; $(deno) fmt --check --config='$(deno_config)'

.PHONY: test-lint
test-lint:; $(deno) lint --config='$(deno_config)' $(if $(value v),,--quiet)

.PHONY: test-unit
test-unit: build; $(deno) test --allow-read=. --config='$(deno_config)' $(test_unit_args)

.PHONY: test-unit-update
test-unit-update: test_unit_args += --allow-write=. -- --update
test-unit-update: test-unit

$(dist_dir)/%: $(assets_dir)/% | $(dist_dir)/; $(cp) '$<' '$@'

$(assets_dir)/atlas.json $(assets_dir)/atlas.png&: $(atlas_in_files)
  ../atlas-pack/bin/aseprite-batch \
    --merge-duplicates \
    --sheet '$(assets_dir)/atlas.png' \
    $^ \
    --color-mode=indexed|
  ../atlas-pack/bin/atlas-pack > '$(assets_dir)/atlas.json'

# $1 stem suffix
# $2 scale
define favicon_template =
$$(dist_dir)/favicon$(1).png: $$(assets_dir)/favicon.aseprite | $$(dist_dir)/
  $$(aseprite) '$$<' --scale $(2) --save-as '$$@'
endef
$(eval $(call favicon_template,,1))
$(eval $(call favicon_template,32x32,2))
$(eval $(call favicon_template,48x48,3))
$(eval $(call favicon_template,64x64,4))
$(eval $(call favicon_template,192x192,12))
$(eval $(call favicon_template,512x512,32))

$(dist_dir)/:; $(mkdir) '$@'

.PHONY: clean
clean:
  $(rm) '$(dist_dir)/' '$(assets_dir)/atlas.json' '$(assets_dir)/atlas.png'
