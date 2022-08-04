# jsonフォルダ内のjsonファイルの名前の配列を作って書き出す

import pathlib
import json

assetsPath = '/Users/chige/projects/research/research-restore-ui-test/assets/'
path = '%s/json' % (assetsPath)
p_temp = list(pathlib.Path(path).glob('*.json'))

fileNameList = []
for i in p_temp:
  fileNameList.append(i.name)

outputPath = '%s/fileNameList.json' % (assetsPath)

with open(outputPath, 'w') as f:
  json.dump(fileNameList, f, ensure_ascii=False, indent=2)