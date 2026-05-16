// Supabase client
const SUPABASE_URL = 'https://hgejsvcohheguxbwhhrg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZWpzdmNvaGhlZ3V4YndoaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTQ5ODEsImV4cCI6MjA5NDMzMDk4MX0.k-dZInW1Wvt8FU57D98J-gXUqM0UmBSYf_Lli1PT5o8';

const _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Maps app camelCase field names → actual lowercase DB column names
const FIELD_MAP = {
  schoolId:                    'schoolid',
  schoolName:                  'schoolname',
  municipality:                'municipality',
  proposedFundingYear:         'proposedfundingyear',
  ranking:                     'ranking',
  kinderRooms:                 'kinderrooms',
  g13Rooms:                    'g13rooms',
  g46Rooms:                    'g46rooms',
  jhsRooms:                    'jhsrooms',
  shsRooms:                    'shsrooms',
  primaryMorningStudents:      'primarymorningstudents',
  primaryAfternoonStudents:    'primaryafternoonstudents',
  secondaryMorningStudents:    'secondarymorningstudents',
  secondaryAfternoonStudents:  'secondaryafternoonstudents',
  existingPrimaryChairs:       'existingprimarychairs',
  existingSecondaryChairs:     'existingsecondarychairs',
  plannedPrimaryChairs:        'plannedprimarychairs',
  plannedSecondaryChairs:      'plannedsecondarychairs',
  adminRemarks:                'adminremarks'
};

// Reverse map: DB column → app field name (for reading rows back)
const REVERSE_MAP = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([app, db]) => [db, app])
);

/** Convert an app school object → DB row (lowercase keys) */
function toDbRow(school) {
  const row = {};
  for (const [appKey, dbCol] of Object.entries(FIELD_MAP)) {
    const val = school[appKey];
    row[dbCol] = (val === '' || val === undefined) ? null : val;
  }
  return row;
}

/** Convert a DB row (lowercase keys) → app school object (camelCase keys) */
function fromDbRow(row) {
  const school = {};
  for (const [dbCol, appKey] of Object.entries(REVERSE_MAP)) {
    school[appKey] = row[dbCol] ?? '';
  }
  return school;
}

/** Load all schools from chair_planning. Returns array or null on error. */
async function dbLoadSchools() {
  const dbCols = Object.values(FIELD_MAP).join(',');
  const { data, error } = await _db
    .from('chair_planning')
    .select(dbCols)
    .order('id', { ascending: true });

  if (error) { console.error('dbLoadSchools error:', error.message); return null; }
  return data.map(fromDbRow);
}

/** Upsert a single school. Uses schoolid as the conflict key. */
async function dbSaveSchool(school) {
  if (!school.schoolId) return; // skip schools with no ID
  const { error } = await _db
    .from('chair_planning')
    .upsert(toDbRow(school), { onConflict: 'schoolid' });

  if (error) console.error('dbSaveSchool error:', error.message);
}

/** Delete a school by schoolId. */
async function dbDeleteSchool(schoolId) {
  const { error } = await _db
    .from('chair_planning')
    .delete()
    .eq('schoolid', schoolId);

  if (error) console.error('dbDeleteSchool error:', error.message);
}

/** Load global parameters from app_parameters. Returns object or null. */
async function dbLoadParameters() {
  const { data, error } = await _db
    .from('app_parameters')
    .select('data')
    .eq('key', 'global')
    .maybeSingle();

  if (error) { console.error('dbLoadParameters error:', error.message); return null; }
  return data?.data ?? null;
}

/** Save global parameters to app_parameters. */
async function dbSaveParameters(parameters) {
  const { error } = await _db
    .from('app_parameters')
    .upsert(
      { key: 'global', data: parameters, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) console.error('dbSaveParameters error:', error.message);
}

console.log('Supabase client ready:', SUPABASE_URL);

/** Log an action to the audit_log table. */
async function dbLogAction(action, details = '') {
  try {
    const { data: { session } } = await _db.auth.getSession();
    if (!session) return;

    const { data: profile } = await _db
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    const username = profile?.username || session.user.email || 'unknown';

    await _db.from('audit_log').insert({
      username,
      action,
      details: details || null
    });
  } catch (err) {
    console.warn('Audit log failed:', err.message);
  }
}
