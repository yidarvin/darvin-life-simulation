# Music files

Drop chiptune `.mp3` files here, one per phase. Phase names come from
`src/utils/phaseResolution.js`:

- `undergrad-freshman.mp3`
- `undergrad-sophomore.mp3`
- `undergrad-junior.mp3`
- `undergrad-senior.mp3`
- `internship.mp3`
- `faang-low.mp3`, `faang-mid.mp3`, `faang-high.mp3`
- `startup-low.mp3`, `startup-mid.mp3`, `startup-high.mp3`
- `phd-low.mp3`, `phd-mid.mp3`, `phd-high.mp3`
- `upwork-low.mp3`, `upwork-mid.mp3`, `upwork-high.mp3`

Composed in BeepBox (https://www.beepbox.co/) — open the BeepBox `.json`
exports stored in `_source/` (gitignored) to edit.

Missing files are handled gracefully: the game stays silent for that phase
until the file is added.

## Recommended export settings

- Format: MP3, 128 kbps (sufficient for chiptune; smaller files)
- Length: 30-60 second loop
- Loop point: end-of-song lands back on tonic for seamless repeat
