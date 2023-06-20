CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE metrics (
    id integer NOT NULL,
    time timestamp with time zone NOT NULL,
    name text NOT NULL,
    value DOUBLE PRECISION NULL
);

CREATE SEQUENCE seq_metrics START 1;

SELECT create_hypertable('metrics','time');

CREATE INDEX ix_metrics_name_time ON metrics (name, time DESC);
