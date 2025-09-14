/**
 * MongoDB Queries to Check for Duplicate Members
 * 
 * Run these queries in MongoDB shell or MongoDB Compass to find duplicate members
 */

// 1. Find spaces with duplicate user IDs
db.spaces.aggregate([
  { $unwind: "$members" },
  { $group: {
    _id: { spaceId: "$_id", spaceName: "$name", userId: "$members.user" },
    count: { $sum: 1 },
    memberIds: { $push: "$members._id" },
    roles: { $push: "$members.role" }
  }},
  { $match: { count: { $gt: 1 } } },
  { $project: {
    spaceName: 1,
    userId: 1,
    duplicateCount: "$count",
    memberIds: 1,
    roles: 1
  }}
]).pretty();

// 2. Find workspaces with duplicate user IDs
db.workspaces.aggregate([
  { $unwind: "$members" },
  { $group: {
    _id: { workspaceId: "$_id", workspaceName: "$name", userId: "$members.user" },
    count: { $sum: 1 },
    memberIds: { $push: "$members._id" },
    roles: { $push: "$members.role" }
  }},
  { $match: { count: { $gt: 1 } } },
  { $project: {
    workspaceName: 1,
    userId: 1,
    duplicateCount: "$count",
    memberIds: 1,
    roles: 1
  }}
]).pretty();

// 3. Count total duplicates in spaces
db.spaces.aggregate([
  { $unwind: "$members" },
  { $group: {
    _id: { spaceId: "$_id", userId: "$members.user" },
    count: { $sum: 1 }
  }},
  { $match: { count: { $gt: 1 } } },
  { $count: "totalDuplicates" }
]);

// 4. Count total duplicates in workspaces
db.workspaces.aggregate([
  { $unwind: "$members" },
  { $group: {
    _id: { workspaceId: "$_id", userId: "$members.user" },
    count: { $sum: 1 }
  }},
  { $match: { count: { $gt: 1 } } },
  { $count: "totalDuplicates" }
]);

// 5. Find spaces with null user references
db.spaces.find({
  "members.user": null
}, {
  name: 1,
  "members": 1
}).pretty();

// 6. Find workspaces with null user references
db.workspaces.find({
  "members.user": null
}, {
  name: 1,
  "members": 1
}).pretty();

// 7. Get detailed member breakdown for a specific space
// Replace SPACE_ID with actual space ID
db.spaces.findOne(
  { _id: ObjectId("SPACE_ID") },
  { name: 1, members: 1 }
);

// 8. Remove duplicate members from spaces (CAREFUL!)
// This keeps only the first occurrence of each user
db.spaces.updateMany(
  {},
  [
    {
      $set: {
        members: {
          $reduce: {
            input: "$members",
            initialValue: [],
            in: {
              $cond: {
                if: {
                  $in: ["$$this.user", "$$value.user"]
                },
                then: "$$value",
                else: {
                  $concatArrays: ["$$value", ["$$this"]]
                }
              }
            }
          }
        }
      }
    }
  ]
);

// 9. Remove duplicate members from workspaces (CAREFUL!)
db.workspaces.updateMany(
  {},
  [
    {
      $set: {
        members: {
          $reduce: {
            input: "$members",
            initialValue: [],
            in: {
              $cond: {
                if: {
                  $in: ["$$this.user", "$$value.user"]
                },
                then: "$$value",
                else: {
                  $concatArrays: ["$$value", ["$$this"]]
                }
              }
            }
          }
        }
      }
    }
  ]
);

// 10. Update member counts after deduplication
db.spaces.updateMany(
  {},
  [{ $set: { "stats.activeMembersCount": { $size: "$members" } } }]
);
