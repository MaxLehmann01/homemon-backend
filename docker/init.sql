CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.plugs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    protected BOOLEAN NOT NULL DEFAULT FALSE,
    is_on BOOLEAN NOT NULL DEFAULT FALSE,
    auto_shutdown_threshold NUMERIC
);

CREATE TABLE IF NOT EXISTS public.measurements (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    power NUMERIC NOT NULL,
    current NUMERIC NOT NULL,
    voltage NUMERIC NOT NULL,
    temp_c NUMERIC NOT NULL,
    temp_f NUMERIC NOT NULL,
    CONSTRAINT fk_measurements_plug FOREIGN KEY (plug_id) REFERENCES public.plugs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.summaries (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    count_measurements INT NOT NULL,
    power_sum NUMERIC NOT NULL,
    power_avg NUMERIC NOT NULL,
    current_avg NUMERIC NOT NULL,
    voltage_avg NUMERIC NOT NULL,
    temp_c_avg NUMERIC NOT NULL,
    temp_f_avg NUMERIC NOT NULL,
    CONSTRAINT fk_summaries_plug FOREIGN KEY (plug_id) REFERENCES public.plugs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.reports (
    id SERIAL PRIMARY KEY,
    plug_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    report_date DATE NOT NULL,
    summaries JSONB NOT NULL DEFAULT '[]'::JSONB,
    CONSTRAINT fk_reports_plug FOREIGN KEY (plug_id) REFERENCES public.plugs(id) ON DELETE CASCADE,
    UNIQUE (plug_id, report_date)
);
