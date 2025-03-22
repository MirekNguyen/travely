CREATE TABLE "prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"price_czk" numeric(10, 2) NOT NULL,
	"continent" varchar(50) NOT NULL,
	"created_at" date DEFAULT now()
);
