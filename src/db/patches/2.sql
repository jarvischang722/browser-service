
CREATE TABLE browser (
    id serial,
    platform varchar(255),
    client varchar(255),
    version varchar(255),
    link text,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_browser` (`client`,`platform`)
);

INSERT INTO browser (platform, client, version, link)
VALUES
    ('windows', 'agtop', '2.8.88', 'http://www.agtop.t1t.games/safetybrowser-agtop-setup.exe'),
    ('windows', 'hxpj', '2.8.88', 'http://www.hxpj.t1t.games/safetybrowser-hxpj-setup.exe'),
    ('windows', 'le18', '2.8.88', 'http://www.le18.com/safetybrowser-le18-setup.exe'),
    ('windows', 'macaopj', '2.9.0', 'http://www.p9601.com/safetybrowser-macaopj-setup.exe'),
    ('windows', 'mgm', '2.8.88', 'http://www.9989234.com/safetybrowser-mgm-setup.exe'),
    ('windows', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/install.exe'),
    ('windows', 'twinbet', '2.8.88', 'http://www.cn.twinbet.com/safetybrowser-twinbet-setup.exe'),
    ('windows', 'xc33', '2.8.88', 'http://www.xc33.com/safetybrowser-xc33-setup.exe'),
    ('windows', 'xpj', '2.8.88', 'http://www.xpj.t1t.games/safetybrowser-xpj-setup.exe'),
    ('windows', 'yuanbao361', '2.9.0', 'http://www.demo.tripleonetech.com/safety-browser/safety-browser-yuanbao361-setup.exe'),
    ('windows', 'wb88', '2.9.1', 'http://www.demo.tripleonetech.com/safety-browser/safety-browser-wb88-setup.exe'),
    ('mac', 'le18', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Le18.zip'),
    ('mac', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Tripleonetech.zip'),
    ('mac', 'twinbet', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/Twinbet.zip'),
    ('mac', 'xc33', '2.8.88', 'http://www.demo.tripleonetech.com/safety-browser/XC33.zip'),
    ('android', 'agtop', '2.8.88', 'http://www.agtop.t1t.games/app-Agtop.apk'),
    ('android', 'le18', '2.8.88', 'http://www.le18.com/app-Leyin.apk'),
    ('android', 'macaopj', '2.8.88', 'http://www.macaopj.t1t.games/app-Macaopj.apk'),
    ('android', 'mgm', '2.8.88', 'http://www.9989234.com/app-Mgm.apk'),
    ('android', 'tripleone', '2.8.88', 'http://www.demo.tripleonetech.com/app-TripleOneTech1.apk'),
    ('android', 'twinbet', '2.8.88', 'http://www.cn.twinbet.com/app-Twinbet.apk'),
    ('android', 'xc33', '2.8.88', 'http://www.xc33.com/app-Xc33.apk'),
    ('android', 'xpj', '2.8.88', 'http://www.xpj.t1t.games/app-Xpj.apk'),
    ('android', 'wb88', '2.8.88', 'http://m.master.tripleonetech.net/app-Mwb88.apk')
;