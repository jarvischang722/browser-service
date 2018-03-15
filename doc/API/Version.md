### ✔ 短地址管理

只有tripleone可以调用

#### ✔ `POST` `/version/info` - 新增或更新版本号

+ Parameters:

Field Name       | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------  | -------------
user               | body   | Number    | Required   |                            | 用户id
platform        | body   | String    | Required   |  valid(windows, mac, ios, android) | 平台
link            | body   | String     | Required   |                               | 长地址
version         | body   | String     | Required   |                               | 网站名称

+ Return: `HTTP Status: 204`

---------------------

#### ✔ `GET` `/version/list` - 获取某客户下版本号列表

+ Parameters:

Field Name     | Scope   | Type       | Attributes  | Validation              | Description      
-------------- | ------- | ---------- | ----------- | --------------------   | -------------
user           | query   | Number     | Required    |   Int, Min(1)           | 用户id

+ Return: `HTTP Status: 200`

```javascript
{
  "total": 10,
  "items": [
    {
      "id": 1,
      "platform": "ios",
      "link": "apple.com",
      "version": "xxx"
    }
  ]
}
```
---------------------

#### ✔ `GET` `/short/detail` - 获取短地址详情

+ Parameters:

Field Name     | Scope   | Type       | Attributes | Validation                  | Description      
-------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id           | query   | Number     | Required   |   Int, Min(1)   | id

+ Return: `HTTP Status: 200`

```javascript
{
  "id": 1,
  "platform": "ios",
  "link": "apple.com",
  "version": "xxx"
}
```
---------------------
