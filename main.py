import urllib.request
from urllib.parse import quote
import string
import json #读取json
import sqlite3
import time
import math

def getUps():
    conn = sqlite3.connect("UPInfo.db")
    #conn.execute('''CREATE TABLE IF NOT EXISTS UPInfo(ID REAl PRIMARY KEY,name TEXT,uid INT,lid INT);''')
    cursor = conn.cursor()
    ndata = cursor.execute("SELECT * FROM UPInfo ORDER BY ID")
    data = []
    for k in ndata:
        data.append(k)
    cursor.close()
    conn.commit()
    return data

def getHtml(url):
    headers = {'User-Agent':'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'}  
    url = quote(url,safe = string.printable)
    url = url.replace(" ","+")
    req = urllib.request.Request(url, headers=headers)    
    file = urllib.request.urlopen(req)
    data = file.read()
    return data

def getFollowers(uid):
    html = getHtml("https://api.bilibili.com/x/relation/stat?vmid="+uid)
    js = json.loads(html)
    return js["data"]["follower"]

def getGuardsInnerFunc1(guards,inflist):
    for k in inflist:
        guards[int(k["guard_level"])-1] += 1
    return guards

def getGuards(uid,lid):
    html = getHtml("https://api.live.bilibili.com/xlive/app-room/v2/guardTab/topList?roomid=%s&page=1&ruid=%s&page_size=100" % (lid,uid))
    js = json.loads(html)
    pages = int(js["data"]["info"]["page"])
    arr = [0]*3
    arr = getGuardsInnerFunc1(arr,js["data"]["top3"])
    for i in range(pages):
        if arr[2] > 0:
            arr[2] = js["data"]["info"]["num"]-arr[0]-arr[1]
            break
        if (i == 0):
            arr = getGuardsInnerFunc1(arr,js["data"]["list"])
        else:
            html = getHtml("https://api.live.bilibili.com/xlive/app-room/v2/guardTab/topList?roomid=%s&page=%s&ruid=%s&page_size=100" % (lid,str(i+1),uid))
            js = json.loads(html)
            arr = getGuardsInnerFunc1(arr,js["data"]["list"])
            time.sleep(0.1)
    return arr

def getFanClub(uid):
    html = getHtml("https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuMedalAnchorInfo?ruid=" + uid)
    js = json.loads(html)
    return int(js["data"]["fans_club_count"])

def writeSql(ts,ID,f,g_,c):
    con = sqlite3.connect("Data.db")
    cur = con.cursor()
    sql = "CREATE TABLE IF NOT EXISTS Data(time DATETIME,ID INT,follower INT,guard1 INT,guard2 INT,guard3 INT,fanclub INT)"
    cur.execute(sql)
    cur.execute("INSERT INTO Data VALUES ('%s', %s, %s, %s, %s, %s, %s)" % (ts,ID,f,g_[0],g_[1],g_[2],c))
    cur.fetchall()  
    print ("succeed")
    cur.close()
    con.commit()

def main(timestamp):
    print("Current time: "+str(timestamp))
    print("Start writing.")
    print("================================================")
    ndata = getUps()
    for key in ndata:
        uid = str(key[2])
        lid = str(key[3])
        f = getFollowers(uid)#粉丝数
        g_ = getGuards(uid,lid)#总督|提督|舰长
        c = getFanClub(uid)#粉丝团
        print("UP:%s(ID:%s,uid:%s,lid:%s),Fans:%s,Guard1:%s,Guard2:%s,Guard3:%s,FanClub:%s." % (key[1],key[0],uid,lid,f,g_[0],g_[1],g_[2],c))
        writeSql(timestamp,key[0],f,g_,c)
        time.sleep(0.2)
    print("================================================")
    print("Wrote done.")

def wait(t):
    while True:
        timestamp = int(time.time())# + 8*60*60
        tn = time.localtime(timestamp)
        hour = tn[3]
        min = tn[4]
        sec = tn[5]
        minutes = hour*60+min+(sec/60)
        yushu = minutes % t
        if (hour*60+min)%t == 0:
            return "1"
        else:
            last = t-yushu
            if last >= 1:
                timeToWait = math.ceil((last-1)*60) + 2
                print("sleep for "+str(timeToWait)+"s")
                time.sleep(timeToWait)
            else:
                print(last)
                time.sleep(1)

#main(int(time.time()))


print("START. "+str(time.localtime(time.time())))
while True:
    wait(30)
    main(int(time.time()))# + 8*60*60)
    time.sleep(60)

#lid:https://api.bilibili.com/x/space/acc/info?mid=2299184&jsonp=jsonp
#Guard Num:view-source:https://live.bilibili.com/8725120?broadcast_type=0
#Fan Club:https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuMedalAnchorInfo?ruid=397790144