#!/bin/sh
# Découpe une vidéo du hero en images WebP pour assets/frames/.
# Usage : npm run frames -- porte.mp4 porte
#         npm run frames -- depart.mp4 depart
# Produit assets/frames/<nom>/ (1600 px, ordinateur) et assets/frames/<nom>-m/ (900 px, mobile).
# Nécessite ffmpeg et cwebp (brew install ffmpeg webp).
set -e
VIDEO="$1"
NAME="$2"
COUNT="${3:-60}"
if [ -z "$VIDEO" ] || [ -z "$NAME" ]; then
	echo "Usage : npm run frames -- <video.mp4> <porte|depart> [nombre d'images, 60 par défaut]"
	exit 1
fi
TMP="$(mktemp -d)"
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VIDEO")
FPS=$(echo "$COUNT / $DUR" | bc -l)
echo "Extraction de $COUNT images de $VIDEO ($DUR s)…"
ffmpeg -loglevel error -y -i "$VIDEO" -vf "fps=$FPS" -frames:v "$COUNT" "$TMP/%03d.png"
for SIZE in desktop mobile; do
	if [ "$SIZE" = desktop ]; then DIR="assets/frames/$NAME"; W=1600; Q=72; else DIR="assets/frames/$NAME-m"; W=900; Q=68; fi
	mkdir -p "$DIR"
	find "$DIR" -name '*.webp' -delete
	for F in "$TMP"/*.png; do
		cwebp -quiet -q "$Q" -resize "$W" 0 "$F" -o "$DIR/$(basename "$F" .png).webp"
	done
	echo "$DIR : $(ls "$DIR" | grep -c webp) images, $(du -sh "$DIR" | cut -f1)"
done
rm -rf "$TMP"
echo "Terminé. Lancez le site avec ?calage pour caler l'enseigne (src/content/reglages.ts)."
