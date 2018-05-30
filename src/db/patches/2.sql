
CREATE TABLE browser (
    id serial,
    userid bigint,
    platform varchar(255),
    client varchar(255),
    version varchar(255),
    status int DEFAULT 1,
    link text,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_browser` (`client`,`platform`),
    FOREIGN KEY (userid) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT INTO browser (userid, platform, client, version, link)
VALUES
    (1, 'Windows', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/install.exe'),
    (2, 'Windows', 'agtop', '2.8.88', 'http://www.agtop.t1t.games/safetybrowser-agtop-setup.exe'),
    (3, 'Windows', 'hxpj', '2.8.88', 'http://www.hxpj.t1t.games/safetybrowser-hxpj-setup.exe'),
    (4, 'Windows', 'le18', '2.9.2', 'http://www.le18.com/safetybrowser-le18-setup.exe'),
    (5, 'Windows', 'macaopj', '2.9.2', 'http://www.p9601.com/safetybrowser-macaopj-setup.exe'),
    (6, 'Windows', 'mgm', '2.8.88', 'http://www.9989234.com/safetybrowser-mgm-setup.exe'),
    (7, 'Windows', 'twinbet', '2.8.88', 'http://www.cn.twinbet.com/safetybrowser-twinbet-setup.exe'),
    (8, 'Windows', 'xc33', '2.9.2', 'http://www.xc33.com/safetybrowser-xc33-setup.exe'),
    (9, 'Windows', 'xpj', '2.8.88', 'http://www.xpj.t1t.games/safetybrowser-xpj-setup.exe'),
    (10, 'Windows', 'yuanbao361', '2.9.2', 'http://www.demo.tripleonetech.com/safety-browser/safety-browser-yuanbao361-setup.exe'),
    (11, 'Windows', 'wb88', '2.9.1', 'http://www.demo.tripleonetech.com/safety-browser/safety-browser-wb88-setup.exe'),
    (1, 'macOS', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Tripleonetech.zip'),
    (4, 'macOS', 'le18', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Le18.zip'),
    (7, 'macOS', 'twinbet', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Twinbet.zip'),
    (8, 'macOS', 'xc33', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/XC33.zip'),
    (1, 'Android', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/app-TripleOneTech1.apk'),
    (2, 'Android', 'agtop', '2.8.88', 'http://www.agtop.t1t.games/app-Agtop.apk'),
    (4, 'Android', 'le18', '2.8.88', 'http://www.le18.com/app-Leyin.apk'),
    (5, 'Android', 'macaopj', '2.8.88', 'http://www.macaopj.t1t.games/app-Macaopj.apk'),
    (6, 'Android', 'mgm', '2.8.88', 'http://www.9989234.com/app-Mgm.apk'),
    (7, 'Android', 'twinbet', '2.8.88', 'http://www.cn.twinbet.com/app-Twinbet.apk'),
    (8, 'Android', 'xc33', '2.8.88', 'http://www.xc33.com/app-Xc33.apk'),
    (9, 'Android', 'xpj', '2.8.88', 'http://www.xpj.t1t.games/app-Xpj.apk'),
    (11, 'Android', 'wb88', '2.8.88', 'http://m.master.tripleonetech.net/app-Mwb88.apk')
;