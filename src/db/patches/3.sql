CREATE TABLE player_mapping (
    id serial,
    playerid int,
    third_party varchar(255),
    third_party_id int,
    token varchar(255),
    created timestamp DEFAULT CURRENT_TIMESTAMP,
    last_updated timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
