ALTER TABLE port DROP COLUMN client;

CREATE TABLE short (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  short varchar(255) UNIQUE,
  `long` varchar(255),
  site_name varchar(255),
  logo_url text,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO short (
  short, `long`, site_name, logo_url
) VALUES 
  ('t1t', 'www.tripleonetech.net', '合众科技', ''),
  ('tot', 'www.tripleonetech.net', '合众科技', ''),
  ('apple', 'www.apple.com', '苹果', ''),
  ('lanhai', 'www.lanhai.t1t.games', '', ''),
  ('xc', 'm.xc33.com', '新橙', 'http://52.198.79.141/download/icon/xc.png'),
  ('youhu', 'm.youhu.t1t.games', '游虎娱乐', 'http://52.198.79.141/download/icon/youhu.png'),
  ('macaopj', 'm.p9601.com', '澳门葡京', 'http://52.198.79.141/download/icon/macaopj.png'),
  ('xpj', 'm.xpj.t1t.games', '新葡京', 'http://52.198.79.141/download/icon/xpj.png'),
  ('lebo', 'm.lbbet888.com', '乐博', 'http://52.198.79.141/download/icon/lebo.png'),
  ('lequ', 'm.lequ.t1t.games', '乐趣时时彩', 'http://52.198.79.141/download/icon/lequ.png'),
  ('dlcity', 'm.dlcity.t1t.games', '电乐城', 'http://52.198.79.141/download/icon/dlcity.png')
;
