#!/bin/bash
# IndexNow URL submission script
# Submits URLs to Bing, Yandex, Naver, Seznam simultaneously
# NOTE: IndexNow requires all URLs to be on the same host as the key file.
#       Each domain needs its own key file to submit its URLs.
# Usage: ./indexnow-submit.sh [urls...]
# If no URLs provided, submits https://sanhost.net/

INDEXNOW_KEY="07d8fbc2-1700-4c21-b294-97c9c7ee60d7"
HOST="sanhost.net"
KEY_LOCATION="https://sanhost.net/${INDEXNOW_KEY}.txt"

# Default: only sanhost.net (IndexNow requires same-host URLs)
if [ $# -gt 0 ]; then
  URLS=("$@")
else
  URLS=("https://sanhost.net/")
fi

# Build JSON URL list
URL_LIST=""
for url in "${URLS[@]}"; do
  [ -n "$URL_LIST" ] && URL_LIST="${URL_LIST},"
  URL_LIST="${URL_LIST}\"${url}\""
done

PAYLOAD="{\"host\":\"${HOST}\",\"key\":\"${INDEXNOW_KEY}\",\"keyLocation\":\"${KEY_LOCATION}\",\"urlList\":[${URL_LIST}]}"

echo "Submitting ${#URLS[@]} URLs via IndexNow..."
for url in "${URLS[@]}"; do echo "  - $url"; done
echo ""

submit() {
  local endpoint="$1"
  local label="$2"
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$endpoint" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$PAYLOAD")
  if [ "$http_code" = "200" ] || [ "$http_code" = "202" ]; then
    echo "  $label: OK ($http_code)"
  else
    echo "  $label: HTTP $http_code"
  fi
}

submit "https://api.indexnow.org/indexnow" "IndexNow API"
submit "https://www.bing.com/indexnow" "Bing"
submit "https://yandex.com/indexnow" "Yandex"

echo ""
echo "Done. Google does NOT support IndexNow - use Google Search Console."
