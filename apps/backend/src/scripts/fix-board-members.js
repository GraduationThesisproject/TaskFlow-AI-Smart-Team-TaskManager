const mongoose = require('mongoose');
const Board = require('../models/Board');
const User = require('../models/User');
require('dotenv').config();

async function fixBoardMembers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('Connected to MongoDB');

    // Find all boards
    const boards = await Board.find({});
    console.log(`Found ${boards.length} boards`);

    let fixedCount = 0;

    for (const board of boards) {
      console.log(`\nProcessing board: ${board.name} (${board._id})`);
      
      // Check if board has members with populated user data
      const populatedBoard = await Board.findById(board._id).populate('members.user', 'name email avatar');
      
      if (populatedBoard.members && populatedBoard.members.length > 0) {
        console.log(`Board has ${populatedBoard.members.length} members`);
        
        // Check each member
        for (let i = 0; i < populatedBoard.members.length; i++) {
          const member = populatedBoard.members[i];
          console.log(`  Member ${i + 1}:`, {
            user: member.user,
            permissions: member.permissions,
            addedAt: member.addedAt
          });
          
          // If user is not populated (just an ObjectId), we need to populate it
          if (typeof member.user === 'string' || member.user._id) {
            console.log(`    User data: ${member.user.name || 'No name'} (${member.user.email || 'No email'})`);
          } else {
            console.log(`    User not populated: ${member.user}`);
          }
        }
        
        // Update the board to ensure it has the correct structure
        await board.save();
        fixedCount++;
      } else {
        console.log('Board has no members');
      }
    }

    console.log(`\nFixed ${fixedCount} boards`);
    console.log('Done!');
    
  } catch (error) {
    console.error('Error fixing board members:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixBoardMembers();
