CREATE TABLE ss_domain (
    id serial,
    userid bigint,
    domain text,
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
);