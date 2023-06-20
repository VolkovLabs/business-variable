CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE metrics (
    id integer NOT NULL,
    time timestamp with time zone NOT NULL,
    name text NOT NULL,
    value DOUBLE PRECISION NULL
);

CREATE TABLE devices (
    id integer NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text NOT NULL
);

CREATE SEQUENCE seq_metrics START 1;
CREATE SEQUENCE seq_devices START 1;

SELECT create_hypertable('metrics','time');

CREATE INDEX ix_metrics_name_time ON metrics (name, time DESC);

insert into devices values (nextval('seq_devices'), 'device1', 'Chicago', 'IL', 'USA');
insert into devices values (nextval('seq_devices'), 'device2', 'Chicago', 'IL', 'USA');
insert into devices values (nextval('seq_devices'), 'device3', 'Tampa', 'FL', 'USA');
insert into devices values (nextval('seq_devices'), 'device4', 'Tampa', 'FL', 'USA');
insert into devices values (nextval('seq_devices'), 'device5', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'device6', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'device7', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'device8', 'New York', 'NY', 'USA');
insert into devices values (nextval('seq_devices'), 'device9', 'Stockholm', 'Stockholm', 'Sweden');
insert into devices values (nextval('seq_devices'), 'device10', 'Stockholm', 'Stockholm', 'Sweden');
insert into devices values (nextval('seq_devices'), 'device11', 'Moscow', 'Moscow', 'Russia');
insert into devices values (nextval('seq_devices'), 'device12', 'Moscow', 'Moscow', 'Russia');
insert into devices values (nextval('seq_devices'), 'device13', 'Tokyo', 'Tokyo', 'Japan');
insert into devices values (nextval('seq_devices'), 'device14', 'Tokyo', 'Tokyo', 'Japan');
insert into devices values (nextval('seq_devices'), 'device15', 'Singapore', 'Singapore', 'Singapore');
insert into devices values (nextval('seq_devices'), 'device16', 'Singapore', 'Singapore', 'Singapore');
