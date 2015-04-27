require 'archieml'
require 'json'

combined = ""
files = Dir.glob(File.expand_path('../1.0/*.aml', __FILE__))
replacements = [
  /^(\s*)([A-Za-z0-9\-_\.]+)([ \t\r]*:)/,
  /^(\s*(?:\[|\{)[ \t\r]*)([A-Za-z0-9\-_\.]+)([ \t\r]*(?:\]|\}))/
]

files.each_with_index do |f, file_index|
  slug, idx = File.basename(f).split('.')

  # Cannot test ignore syntax with a single document
  next if slug.match(/^ignore|all$/)

  aml = File.read(f)

  test = aml.match(/^test:(.*)/)[1].strip
  aml.gsub!(/^test:.*/, '')
  aml.gsub!(/^result:.*/, '')

  # Give all keys a numeric prefix
  prefix = file_index.to_s.rjust(files.length.to_s.length, '0')
  replacements.each do |regex|
    aml.gsub!(regex, "\\1#{prefix}\\2\\3")
  end

  # combined += ['===', "Test #{slug}.#{idx}: #{test}", aml, '{}', ''].join("\n")
  combined += ["=== Test #{slug}.#{idx}", aml, '===', ':endskip', '{}', ''].join("\n")
end
combined.gsub!(/(\n)+/m, "\n")

parsed = Archieml.load(combined)

all = "test: combined test\nresult: #{JSON.dump(parsed)}\n\n" + combined
File.write(File.expand_path('../1.0/all.0.aml', __FILE__), all)
