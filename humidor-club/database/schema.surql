-- =====================================================
-- Humidor Club - SurrealDB Schema
-- Mobile-First, Cigar Domain Model
-- =====================================================

-- Database and namespace
USE NS humidor_club DB production;

-- =====================================================
-- BRANDS & MANUFACTURERS
-- =====================================================

DEFINE TABLE brand SCHEMAFULL
  COMMENT "Cigar manufacturers and brands";

DEFINE FIELD name ON brand TYPE string
  ASSERT $value != NONE AND string::len($value) > 0;
DEFINE FIELD slug ON brand TYPE string
  ASSERT $value != NONE;
DEFINE FIELD country ON brand TYPE option<string>;
DEFINE FIELD founded ON brand TYPE option<int>
  ASSERT $value == NONE OR ($value >= 1800 AND $value <= 2025);
DEFINE FIELD description ON brand TYPE option<string>;
DEFINE FIELD website ON brand TYPE option<string>;
DEFINE FIELD logo_url ON brand TYPE option<string>;
DEFINE FIELD created_at ON brand TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON brand TYPE datetime DEFAULT time::now();

DEFINE INDEX brand_name_idx ON brand COLUMNS name UNIQUE;
DEFINE INDEX brand_slug_idx ON brand COLUMNS slug UNIQUE;

-- =====================================================
-- PRODUCT LINES
-- =====================================================

DEFINE TABLE line SCHEMAFULL
  COMMENT "Product lines within a brand (e.g., 1926 Series)";

DEFINE FIELD name ON line TYPE string
  ASSERT $value != NONE;
DEFINE FIELD slug ON line TYPE string
  ASSERT $value != NONE;
DEFINE FIELD brand ON line TYPE record<brand>
  ASSERT $value != NONE;
DEFINE FIELD description ON line TYPE option<string>;
DEFINE FIELD release_year ON line TYPE option<int>
  ASSERT $value == NONE OR ($value >= 1800 AND $value <= 2025);
DEFINE FIELD discontinued ON line TYPE bool DEFAULT false;
DEFINE FIELD created_at ON line TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON line TYPE datetime DEFAULT time::now();

DEFINE INDEX line_brand_slug_idx ON line COLUMNS brand, slug UNIQUE;
DEFINE INDEX line_brand_idx ON line COLUMNS brand;

-- =====================================================
-- CIGARS (Specific vitolas)
-- =====================================================

DEFINE TABLE cigar SCHEMAFULL
  COMMENT "Specific vitola (shape/size) within a line";

DEFINE FIELD line ON cigar TYPE record<line>
  ASSERT $value != NONE;
DEFINE FIELD vitola ON cigar TYPE string
  ASSERT $value != NONE;
  
-- Dimensions
DEFINE FIELD ring_gauge ON cigar TYPE option<int>
  ASSERT $value == NONE OR ($value >= 20 AND $value <= 100);
DEFINE FIELD length_mm ON cigar TYPE option<int>
  ASSERT $value == NONE OR ($value >= 50 AND $value <= 300);
DEFINE FIELD length_inches ON cigar TYPE option<float>
  ASSERT $value == NONE OR ($value >= 2.0 AND $value <= 12.0);

-- Composition
DEFINE FIELD wrapper ON cigar TYPE option<string>;
DEFINE FIELD binder ON cigar TYPE option<string>;
DEFINE FIELD filler ON cigar TYPE option<string>;
DEFINE FIELD filler_tobaccos ON cigar TYPE option<array<string>>;

-- Characteristics
DEFINE FIELD strength ON cigar TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Mild", "Medium-Mild", "Medium", "Medium-Full", "Full"];
DEFINE FIELD body ON cigar TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Light", "Medium-Light", "Medium", "Medium-Full", "Full"];
  
-- Pricing (in cents)
DEFINE FIELD msrp_cents ON cigar TYPE option<int>
  ASSERT $value == NONE OR $value >= 0;
DEFINE FIELD typical_street_cents ON cigar TYPE option<int>
  ASSERT $value == NONE OR $value >= 0;

-- Origin
DEFINE FIELD country ON cigar TYPE option<string>;
DEFINE FIELD factory ON cigar TYPE option<string>;

-- Computed fields
DEFINE FIELD avg_rating ON cigar TYPE option<float>;
DEFINE FIELD total_ratings ON cigar TYPE int DEFAULT 0;

DEFINE FIELD created_at ON cigar TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON cigar TYPE datetime DEFAULT time::now();

DEFINE INDEX cigar_line_vitola_idx ON cigar COLUMNS line, vitola;
DEFINE INDEX cigar_country_idx ON cigar COLUMNS country;

-- =====================================================
-- RELEASES (Specific batches/production runs)
-- =====================================================

DEFINE TABLE release SCHEMAFULL
  COMMENT "Specific production batch/release of a cigar";

DEFINE FIELD cigar ON release TYPE record<cigar>
  ASSERT $value != NONE;
DEFINE FIELD box_code ON release TYPE option<string>;
DEFINE FIELD box_date ON release TYPE option<datetime>;
DEFINE FIELD year ON release TYPE option<int>
  ASSERT $value == NONE OR ($value >= 1990 AND $value <= 2025);
DEFINE FIELD limited_edition ON release TYPE bool DEFAULT false;
DEFINE FIELD production_qty ON release TYPE option<int>
  ASSERT $value == NONE OR $value > 0;
DEFINE FIELD market_status ON release TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Current", "Retired", "Rare", "Discontinued"];

-- Valuation Index (computed from comps)
DEFINE FIELD index_score ON release TYPE option<float>;
DEFINE FIELD index_delta_7d ON release TYPE option<float>;
DEFINE FIELD index_delta_30d ON release TYPE option<float>;
DEFINE FIELD index_delta_90d ON release TYPE option<float>;
DEFINE FIELD last_index_calc ON release TYPE option<datetime>;

DEFINE FIELD created_at ON release TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON release TYPE datetime DEFAULT time::now();

DEFINE INDEX release_box_code_idx ON release COLUMNS box_code;
DEFINE INDEX release_cigar_idx ON release COLUMNS cigar;
DEFINE INDEX release_year_idx ON release COLUMNS year;

-- =====================================================
-- USERS
-- =====================================================

DEFINE TABLE user SCHEMAFULL
  COMMENT "Club members";

DEFINE FIELD email ON user TYPE string
  ASSERT $value != NONE AND string::is::email($value);
DEFINE FIELD display_name ON user TYPE string
  ASSERT $value != NONE;
DEFINE FIELD role ON user TYPE string DEFAULT "MEMBER"
  ASSERT $value INSIDE ["MEMBER", "TRUSTED_SELLER", "MODERATOR", "ADMIN"];

-- Location
DEFINE FIELD city ON user TYPE option<string>;
DEFINE FIELD region ON user TYPE option<string>;
DEFINE FIELD country ON user TYPE option<string>;

-- Gating
DEFINE FIELD age_confirmed_at ON user TYPE option<datetime>;
DEFINE FIELD rules_accepted_at ON user TYPE option<datetime>;
DEFINE FIELD invite_code ON user TYPE option<string>;

-- Reputation
DEFINE FIELD reputation ON user TYPE float DEFAULT 0.0;
DEFINE FIELD verified_at ON user TYPE option<datetime>;

-- Privacy
DEFINE FIELD email_verified ON user TYPE option<datetime>;
DEFINE FIELD deleted_at ON user TYPE option<datetime>;

DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON user TYPE datetime DEFAULT time::now();

DEFINE INDEX user_email_idx ON user COLUMNS email UNIQUE;
DEFINE INDEX user_role_idx ON user COLUMNS role;

-- =====================================================
-- HUMIDOR (User Collections)
-- =====================================================

DEFINE TABLE humidor_item SCHEMAFULL
  COMMENT "Cigars in a user's personal collection";

DEFINE FIELD user ON humidor_item TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD cigar ON humidor_item TYPE record<cigar>
  ASSERT $value != NONE;
DEFINE FIELD release ON humidor_item TYPE option<record<release>>;

DEFINE FIELD quantity ON humidor_item TYPE int DEFAULT 1
  ASSERT $value > 0;
DEFINE FIELD is_collectible ON humidor_item TYPE bool DEFAULT false;

-- Condition & Storage
DEFINE FIELD condition ON humidor_item TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Mint", "Excellent", "Good", "Fair", "Poor"];
DEFINE FIELD provenance ON humidor_item TYPE option<string>;
DEFINE FIELD storage_temp_f ON humidor_item TYPE option<float>;
DEFINE FIELD storage_humidity ON humidor_item TYPE option<float>;
DEFINE FIELD storage_location ON humidor_item TYPE option<string>;

-- Acquisition
DEFINE FIELD acquired_at ON humidor_item TYPE option<datetime>;
DEFINE FIELD acquired_price_cents ON humidor_item TYPE option<int>;
DEFINE FIELD acquired_from ON humidor_item TYPE option<string>;

DEFINE FIELD created_at ON humidor_item TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON humidor_item TYPE datetime DEFAULT time::now();

DEFINE INDEX humidor_user_idx ON humidor_item COLUMNS user;
DEFINE INDEX humidor_cigar_idx ON humidor_item COLUMNS cigar;
DEFINE INDEX humidor_collectible_idx ON humidor_item COLUMNS is_collectible;

-- =====================================================
-- TASTING NOTES
-- =====================================================

DEFINE TABLE tasting_note SCHEMAFULL
  COMMENT "User tasting experiences and ratings";

DEFINE FIELD user ON tasting_note TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD cigar ON tasting_note TYPE record<cigar>
  ASSERT $value != NONE;

-- Overall Rating
DEFINE FIELD rating ON tasting_note TYPE option<float>
  ASSERT $value == NONE OR ($value >= 1.0 AND $value <= 5.0);

-- Smoking Details
DEFINE FIELD smoke_date ON tasting_note TYPE datetime DEFAULT time::now();
DEFINE FIELD smoke_duration_mins ON tasting_note TYPE option<int>;
DEFINE FIELD smoke_location ON tasting_note TYPE option<string>;
DEFINE FIELD occasion ON tasting_note TYPE option<string>;

-- Sensory Attributes
DEFINE FIELD aroma ON tasting_note TYPE option<array<string>>;
DEFINE FIELD draw ON tasting_note TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Tight", "Firm", "Perfect", "Loose", "Very Loose"];
DEFINE FIELD burn ON tasting_note TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Uneven", "Fair", "Good", "Perfect"];
DEFINE FIELD ash_quality ON tasting_note TYPE option<string>
  ASSERT $value == NONE OR $value INSIDE ["Flaky", "Firm", "Very Firm"];

-- Taste Profile (by thirds)
DEFINE FIELD flavor_first_third ON tasting_note TYPE option<array<string>>;
DEFINE FIELD flavor_second_third ON tasting_note TYPE option<array<string>>;
DEFINE FIELD flavor_final_third ON tasting_note TYPE option<array<string>>;

DEFINE FIELD strength ON tasting_note TYPE option<string>;
DEFINE FIELD body ON tasting_note TYPE option<string>;

-- Pairing
DEFINE FIELD paired_with ON tasting_note TYPE option<string>;
DEFINE FIELD pairing_rating ON tasting_note TYPE option<int>
  ASSERT $value == NONE OR ($value >= 1 AND $value <= 5);

-- Rich notes
DEFINE FIELD notes ON tasting_note TYPE option<string>;

DEFINE FIELD created_at ON tasting_note TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON tasting_note TYPE datetime DEFAULT time::now();

DEFINE INDEX tasting_user_idx ON tasting_note COLUMNS user;
DEFINE INDEX tasting_cigar_idx ON tasting_note COLUMNS cigar;
DEFINE INDEX tasting_rating_idx ON tasting_note COLUMNS rating;

-- =====================================================
-- MARKETPLACE COMPS (Comparable Sales)
-- =====================================================

DEFINE TABLE comp SCHEMAFULL
  COMMENT "Comparable sales for valuation";

DEFINE FIELD release ON comp TYPE record<release>
  ASSERT $value != NONE;
DEFINE FIELD source ON comp TYPE string
  ASSERT $value != NONE;
DEFINE FIELD sale_date ON comp TYPE datetime
  ASSERT $value != NONE;
DEFINE FIELD quantity ON comp TYPE int
  ASSERT $value > 0;
DEFINE FIELD condition ON comp TYPE option<string>;
DEFINE FIELD price_cents ON comp TYPE int
  ASSERT $value >= 0;
DEFINE FIELD currency ON comp TYPE string DEFAULT "USD";
DEFINE FIELD region ON comp TYPE option<string>;
DEFINE FIELD url ON comp TYPE option<string>;
DEFINE FIELD verified ON comp TYPE bool DEFAULT false;
DEFINE FIELD added_by ON comp TYPE option<record<user>>;

DEFINE FIELD created_at ON comp TYPE datetime DEFAULT time::now();

DEFINE INDEX comp_release_date_idx ON comp COLUMNS release, sale_date;
DEFINE INDEX comp_date_idx ON comp COLUMNS sale_date;

-- =====================================================
-- MARKETPLACE LISTINGS
-- =====================================================

DEFINE TABLE listing SCHEMAFULL
  COMMENT "Items for sale/trade/wanted in marketplace";

DEFINE FIELD user ON listing TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD type ON listing TYPE string
  ASSERT $value INSIDE ["WTS", "WTB", "WTT"];
DEFINE FIELD title ON listing TYPE string
  ASSERT $value != NONE AND string::len($value) >= 5;
DEFINE FIELD description ON listing TYPE string
  ASSERT $value != NONE;

-- Item Reference
DEFINE FIELD cigar ON listing TYPE option<record<cigar>>;
DEFINE FIELD release ON listing TYPE option<record<release>>;

-- Details
DEFINE FIELD quantity ON listing TYPE int
  ASSERT $value > 0;
DEFINE FIELD condition ON listing TYPE option<string>;
DEFINE FIELD price_cents ON listing TYPE option<int>
  ASSERT $value == NONE OR $value >= 0;
DEFINE FIELD currency ON listing TYPE string DEFAULT "USD";

-- Location & Shipping
DEFINE FIELD city ON listing TYPE option<string>;
DEFINE FIELD region ON listing TYPE option<string>;
DEFINE FIELD country ON listing TYPE option<string>;
DEFINE FIELD meet_up_only ON listing TYPE bool DEFAULT true;
DEFINE FIELD will_ship ON listing TYPE bool DEFAULT false;

-- Status
DEFINE FIELD status ON listing TYPE string DEFAULT "DRAFT"
  ASSERT $value INSIDE ["DRAFT", "ACTIVE", "PENDING", "SOLD", "WITHDRAWN", "FROZEN"];
DEFINE FIELD published_at ON listing TYPE option<datetime>;
DEFINE FIELD sold_at ON listing TYPE option<datetime>;
DEFINE FIELD frozen_at ON listing TYPE option<datetime>;
DEFINE FIELD frozen_reason ON listing TYPE option<string>;

-- Media
DEFINE FIELD photos ON listing TYPE array<string> DEFAULT [];

-- Metrics
DEFINE FIELD view_count ON listing TYPE int DEFAULT 0;

DEFINE FIELD created_at ON listing TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON listing TYPE datetime DEFAULT time::now();

DEFINE INDEX listing_user_status_idx ON listing COLUMNS user, status;
DEFINE INDEX listing_status_published_idx ON listing COLUMNS status, published_at;
DEFINE INDEX listing_type_status_idx ON listing COLUMNS type, status;

-- =====================================================
-- OFFERS & NEGOTIATIONS
-- =====================================================

DEFINE TABLE offer SCHEMAFULL
  COMMENT "Offers on marketplace listings";

DEFINE FIELD listing ON offer TYPE record<listing>
  ASSERT $value != NONE;
DEFINE FIELD from_user ON offer TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD to_user ON offer TYPE record<user>
  ASSERT $value != NONE;

DEFINE FIELD amount_cents ON offer TYPE option<int>
  ASSERT $value == NONE OR $value >= 0;
DEFINE FIELD message ON offer TYPE option<string>;

DEFINE FIELD status ON offer TYPE string DEFAULT "OPEN"
  ASSERT $value INSIDE ["OPEN", "COUNTERED", "ACCEPTED", "DECLINED", "WITHDRAWN"];
DEFINE FIELD parent_offer ON offer TYPE option<record<offer>>;

DEFINE FIELD accepted_at ON offer TYPE option<datetime>;
DEFINE FIELD declined_at ON offer TYPE option<datetime>;

DEFINE FIELD created_at ON offer TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON offer TYPE datetime DEFAULT time::now();

DEFINE INDEX offer_listing_status_idx ON offer COLUMNS listing, status;
DEFINE INDEX offer_from_user_idx ON offer COLUMNS from_user, status;
DEFINE INDEX offer_to_user_idx ON offer COLUMNS to_user, status;

-- =====================================================
-- MESSAGES
-- =====================================================

DEFINE TABLE message SCHEMAFULL
  COMMENT "Private messages between users";

DEFINE FIELD listing ON message TYPE record<listing>
  ASSERT $value != NONE;
DEFINE FIELD from_user ON message TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD to_user ON message TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD body ON message TYPE string
  ASSERT $value != NONE;
DEFINE FIELD read_at ON message TYPE option<datetime>;

DEFINE FIELD created_at ON message TYPE datetime DEFAULT time::now();

DEFINE INDEX message_listing_idx ON message COLUMNS listing, created_at;
DEFINE INDEX message_to_user_unread_idx ON message COLUMNS to_user, read_at;

-- =====================================================
-- FEEDBACK & REPUTATION
-- =====================================================

DEFINE TABLE deal_feedback SCHEMAFULL
  COMMENT "Post-deal feedback for reputation";

DEFINE FIELD for_user ON deal_feedback TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD by_user ON deal_feedback TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD listing ON deal_feedback TYPE record<listing>
  ASSERT $value != NONE;

DEFINE FIELD rating ON deal_feedback TYPE int
  ASSERT $value >= 1 AND $value <= 5;
DEFINE FIELD comment ON deal_feedback TYPE option<string>;

-- Facets
DEFINE FIELD communication_good ON deal_feedback TYPE option<bool>;
DEFINE FIELD packaging_good ON deal_feedback TYPE option<bool>;
DEFINE FIELD item_as_described ON deal_feedback TYPE option<bool>;

DEFINE FIELD created_at ON deal_feedback TYPE datetime DEFAULT time::now();

DEFINE INDEX feedback_for_user_idx ON deal_feedback COLUMNS for_user;
DEFINE INDEX feedback_listing_idx ON deal_feedback COLUMNS listing;

-- =====================================================
-- MODERATION
-- =====================================================

DEFINE TABLE report SCHEMAFULL
  COMMENT "Content/user reports";

DEFINE FIELD type ON report TYPE string
  ASSERT $value INSIDE ["LISTING", "USER", "MESSAGE"];
DEFINE FIELD reported_by ON report TYPE record<user>
  ASSERT $value != NONE;
DEFINE FIELD listing ON report TYPE option<record<listing>>;
DEFINE FIELD reported_user ON report TYPE option<record<user>>;
DEFINE FIELD message ON report TYPE option<record<message>>;

DEFINE FIELD reason ON report TYPE string
  ASSERT $value != NONE;
DEFINE FIELD details ON report TYPE option<string>;

DEFINE FIELD status ON report TYPE string DEFAULT "PENDING"
  ASSERT $value INSIDE ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"];
DEFINE FIELD reviewed_by ON report TYPE option<record<user>>;
DEFINE FIELD reviewed_at ON report TYPE option<datetime>;
DEFINE FIELD resolution ON report TYPE option<string>;

DEFINE FIELD created_at ON report TYPE datetime DEFAULT time::now();

DEFINE INDEX report_status_idx ON report COLUMNS status, created_at;
DEFINE INDEX report_listing_idx ON report COLUMNS listing;

-- =====================================================
-- AUDIT LOG
-- =====================================================

DEFINE TABLE audit_log SCHEMAFULL
  COMMENT "System audit trail";

DEFINE FIELD action ON audit_log TYPE string
  ASSERT $value != NONE;
DEFINE FIELD user ON audit_log TYPE option<record<user>>;
DEFINE FIELD target_type ON audit_log TYPE option<string>;
DEFINE FIELD target_id ON audit_log TYPE option<string>;
DEFINE FIELD metadata ON audit_log TYPE option<object>;
DEFINE FIELD ip_address ON audit_log TYPE option<string>;
DEFINE FIELD user_agent ON audit_log TYPE option<string>;

DEFINE FIELD created_at ON audit_log TYPE datetime DEFAULT time::now();

DEFINE INDEX audit_action_idx ON audit_log COLUMNS action, created_at;
DEFINE INDEX audit_user_idx ON audit_log COLUMNS user;
DEFINE INDEX audit_target_idx ON audit_log COLUMNS target_type, target_id;

-- =====================================================
-- GRAPH RELATIONS (For natural queries)
-- =====================================================

-- Brand produces Lines
DEFINE TABLE produces SCHEMAFULL TYPE RELATION FROM brand TO line;

-- Line contains Cigars
DEFINE TABLE contains SCHEMAFULL TYPE RELATION FROM line TO cigar;

-- Cigar has Releases
DEFINE TABLE has_release SCHEMAFULL TYPE RELATION FROM cigar TO release;

-- User owns Humidor Items
DEFINE TABLE owns SCHEMAFULL TYPE RELATION FROM user TO humidor_item;

-- User rates Cigars
DEFINE TABLE rates SCHEMAFULL TYPE RELATION FROM user TO cigar;
DEFINE FIELD rating ON rates TYPE float;
DEFINE FIELD date ON rates TYPE datetime;

-- =====================================================
-- EXAMPLE QUERIES (For Open Notebook)
-- =====================================================

-- Query 1: "Show me all Padrón cigars in my humidor"
-- SELECT * FROM humidor_item 
-- WHERE cigar.line.brand.name = "Padrón" AND user = $auth.id;

-- Query 2: "What's the average rating for full-bodied cigars?"
-- SELECT 
--   cigar.body,
--   math::mean(rating) AS avg_rating,
--   count() AS total_ratings
-- FROM tasting_note
-- WHERE cigar.body = "Full"
-- GROUP BY cigar.body;

-- Query 3: "Find undervalued Padrón 1926 listings"
-- SELECT 
--   listing.*,
--   (SELECT math::mean(price_cents) FROM comp WHERE release = listing.release) AS market_avg
-- FROM listing
-- WHERE status = "ACTIVE"
--   AND cigar.line.brand.name = "Padrón"
--   AND cigar.line.name CONTAINS "1926"
--   AND price_cents < (SELECT math::mean(price_cents) FROM comp WHERE release = listing.release) * 0.85;

-- Query 4: "Recommend cigars based on my preferences"
-- SELECT 
--   cigar.*,
--   (SELECT math::mean(rating) FROM tasting_note WHERE cigar = $parent.id AND user = $auth.id) AS my_avg_rating
-- FROM cigar
-- WHERE cigar.strength IN (
--   SELECT DISTINCT cigar.strength FROM tasting_note 
--   WHERE user = $auth.id AND rating >= 4.0
-- )
-- AND cigar NOT IN (
--   SELECT cigar FROM tasting_note WHERE user = $auth.id
-- )
-- ORDER BY avg_rating DESC
-- LIMIT 10;

