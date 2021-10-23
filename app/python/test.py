import os

with os.scandir('/Users/zsu/workspaces/sh/files') as contents:
    print(sum(1 for e in contents))