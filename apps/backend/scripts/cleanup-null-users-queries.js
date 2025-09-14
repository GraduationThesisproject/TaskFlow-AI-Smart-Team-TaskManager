/**
 * MongoDB Queries to Clean Up Null User References
 * 
 * Run these queries in MongoDB shell or MongoDB Compass to clean up null user references
 * 
 * IMPORTANT: Always backup your database before running these queries!
 */

// 1. Find spaces with null user references
db.spaces.find({
  "members.user": null
}, {
  name: 1,
  "members": 1
}).pretty();

// 2. Count spaces with null user references
db.spaces.countDocuments({
  "members.user": null
});

// 3. Find workspaces with null user references
db.workspaces.find({
  "members.user": null
}, {
  name: 1,
  "members": 1
}).pretty();

// 4. Count workspaces with null user references
db.workspaces.countDocuments({
  "members.user": null
});

// 5. Remove null user references from spaces (CAREFUL!)
db.spaces.updateMany(
  { "members.user": null },
  { $pull: { "members": { "user": null } } }
);

// 6. Remove null user references from workspaces (CAREFUL!)
db.workspaces.updateMany(
  { "members.user": null },
  { $pull: { "members": { "user": null } } }
);

// 7. Update space member counts after cleanup
db.spaces.updateMany(
  {},
  [{ $set: { "stats.activeMembersCount": { $size: "$members" } } }]
);

// 8. Find orphaned references (user IDs that don't exist)
// First, get all existing user IDs
var existingUserIds = db.users.distinct("_id");

// Then find space members with non-existent user IDs
db.spaces.find({
  "members.user": { $nin: existingUserIds }
}, {
  name: 1,
  "members.user": 1
}).pretty();

// 9. Remove orphaned references from spaces (CAREFUL!)
db.spaces.updateMany(
  { "members.user": { $nin: existingUserIds } },
  { $pull: { "members": { "user": { $nin: existingUserIds } } } }
);

// 10. Remove orphaned references from workspaces (CAREFUL!)
db.workspaces.updateMany(
  { "members.user": { $nin: existingUserIds } },
  { $pull: { "members": { "user": { $nin: existingUserIds } } } }
);

// 11. Find spaces with empty members array
db.spaces.find({
  "members": { $size: 0 }
}, {
  name: 1,
  "members": 1
}).pretty();

// 12. Find workspaces with empty members array
db.workspaces.find({
  "members": { $size: 0 }
}, {
  name: 1,
  "members": 1
}).pretty();

// 13. Comprehensive cleanup script (run this after backing up!)
/*
// Step 1: Backup (run this first!)
db.spaces.find().forEach(function(doc) {
  db.spaces_backup.insertOne(doc);
});

db.workspaces.find().forEach(function(doc) {
  db.workspaces_backup.insertOne(doc);
});

// Step 2: Remove null user references
db.spaces.updateMany(
  { "members.user": null },
  { $pull: { "members": { "user": null } } }
);

db.workspaces.updateMany(
  { "members.user": null },
  { $pull: { "members": { "user": null } } }
);

// Step 3: Get existing user IDs
var existingUserIds = db.users.distinct("_id");

// Step 4: Remove orphaned references
db.spaces.updateMany(
  { "members.user": { $nin: existingUserIds } },
  { $pull: { "members": { "user": { $nin: existingUserIds } } } }
);

db.workspaces.updateMany(
  { "members.user": { $nin: existingUserIds } },
  { $pull: { "members": { "user": { $nin: existingUserIds } } } }
);

// Step 5: Update member counts
db.spaces.updateMany(
  {},
  [{ $set: { "stats.activeMembersCount": { $size: "$members" } } }]
);

// Step 6: Verify cleanup
db.spaces.countDocuments({ "members.user": null });
db.workspaces.countDocuments({ "members.user": null });
*/
