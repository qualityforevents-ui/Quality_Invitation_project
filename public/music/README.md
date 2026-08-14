# Music library

The app expects eight files in this folder. They are not in the repo, because I cannot
source or generate licensed audio. Until you add them the app runs normally, the
invitation simply opens without sound and the mute toggle hides itself.

Run `npm run check:music` at any time to see which files are still missing and whether
the ones present meet the encoding budget.

## Required filenames

The manifest in `src/lib/music.ts` maps each track id to a filename. Match these exactly:

| File | Arabic name | English name | Intended mood |
|---|---|---|---|
| `oud-nights.mp3` | ليالي العود | Oud Nights | Classical oud, calm |
| `piano-vows.mp3` | وعد | Vows | Soft piano |
| `strings-morning.mp3` | صباح الفرح | Morning Strings | Light orchestral strings |
| `modern-romance.mp3` | حكاية | A Story | Modern romantic instrumental |
| `joyful-zaffa.mp3` | زفة الفرح | Joyful Zaffa | Upbeat, suits engagements |
| `baladi-wedding.mp3` | فرح بلدي | Baladi Wedding | Traditional Egyptian wedding |
| `qanun-serenade.mp3` | همس القانون | Qanun Serenade | Qanun and ney, oriental |
| `cinematic-forever.mp3` | للأبد | Forever | Cinematic, wide |

You can rename any track in `src/lib/music.ts` if the file you licence has a different
character. Keep the id stable once an invitation has been sold with it, because the id
is what is stored on the invitation row.

## Encoding

Guests open these on mobile data at a family gathering, so the budget is tight:

- MP3, 128 kbps, mono
- 60 to 90 seconds, chosen so the loop point is not jarring
- Under 1.5 MB per file
- Normalised to the same loudness across all eight, target around -16 LUFS

Switching themes changes the default track, and if one file is mastered louder than
the others that switch produces a jump in volume that sounds like a bug.

An ffmpeg pass that satisfies all of the above:

```sh
ffmpeg -i source.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ac 1 -b:a 128k -t 90 oud-nights.mp3
```

## Licensing

Royalty free or properly licensed only. No commercial songs. Keep the licence
certificate or purchase receipt for each track somewhere you can find it later.
