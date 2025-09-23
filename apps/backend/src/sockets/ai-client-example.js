/**
 * AI Socket Client Example
 * 
 * This file demonstrates how to use the AI socket functionality
 * from the frontend or any client application.
 */

const io = require('socket.io-client');

// Example usage of AI socket functionality
class AISocketClient {
  constructor(serverUrl, token) {
    this.serverUrl = serverUrl;
    this.token = token;
    this.socket = null;
    this.isConnected = false;
  }

  // Connect to AI socket namespace
  connect() {
    this.socket = io(`${this.serverUrl}/ai`, {
      auth: {
        token: this.token
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to AI socket');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from AI socket:', reason);
      this.isConnected = false;
    });

    this.socket.on('connected', (data) => {
      console.log('🤖 AI socket ready:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ AI socket error:', error);
    });

    return this;
  }

  // Disconnect from AI socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Generate board using AI
  async generateBoard(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Board generation timeout'));
      }, 30000);

      this.socket.once('board_generated', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Board generation failed'));
        }
      });

      this.socket.once('board_generation_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Board generation failed'));
      });

      this.socket.emit('generate_board', { prompt, options });
    });
  }

  // Auto-complete prompt
  async autoCompletePrompt(partialPrompt, context = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Auto-completion timeout'));
      }, 10000);

      this.socket.once('auto_complete_suggestions', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Auto-completion failed'));
        }
      });

      this.socket.once('auto_complete_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Auto-completion failed'));
      });

      this.socket.emit('auto_complete_prompt', { partialPrompt, context });
    });
  }

  // Get smart suggestions
  async getSmartSuggestions(input, type = 'board') {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Smart suggestions timeout'));
      }, 10000);

      this.socket.once('smart_suggestions', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Smart suggestions failed'));
        }
      });

      this.socket.once('smart_suggestions_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Smart suggestions failed'));
      });

      this.socket.emit('get_smart_suggestions', { input, type });
    });
  }

  // Get quick templates
  async getQuickTemplates(category = 'general', count = 5) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Quick templates timeout'));
      }, 10000);

      this.socket.once('quick_templates', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Quick templates failed'));
        }
      });

      this.socket.once('quick_templates_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Quick templates failed'));
      });

      this.socket.emit('get_quick_templates', { category, count });
    });
  }

  // Generate additional tasks
  async generateAdditionalTasks(boardId, columnName, count = 3) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Additional tasks timeout'));
      }, 15000);

      this.socket.once('additional_tasks_generated', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Additional tasks failed'));
        }
      });

      this.socket.once('additional_tasks_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Additional tasks failed'));
      });

      this.socket.emit('generate_additional_tasks', { boardId, columnName, count });
    });
  }

  // Get improvement suggestions
  async getImprovementSuggestions(boardId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Improvement suggestions timeout'));
      }, 15000);

      this.socket.once('improvement_suggestions', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Improvement suggestions failed'));
        }
      });

      this.socket.once('improvement_suggestions_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Improvement suggestions failed'));
      });

      this.socket.emit('get_improvement_suggestions', { boardId });
    });
  }

  // Moderate content
  async moderateContent(text) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Content moderation timeout'));
      }, 10000);

      this.socket.once('content_moderated', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Content moderation failed'));
        }
      });

      this.socket.once('content_moderation_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Content moderation failed'));
      });

      this.socket.emit('moderate_content', { text });
    });
  }

  // Get model information
  async getModelInfo() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to AI socket'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Model info timeout'));
      }, 5000);

      this.socket.once('model_info', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Model info failed'));
        }
      });

      this.socket.once('model_info_error', (response) => {
        clearTimeout(timeout);
        reject(new Error(response.error || 'Model info failed'));
      });

      this.socket.emit('get_model_info');
    });
  }

  // Join board room
  joinBoardRoom(boardId) {
    if (this.isConnected) {
      this.socket.emit('join_board_room', { boardId });
    }
  }

  // Leave board room
  leaveBoardRoom(boardId) {
    if (this.isConnected) {
      this.socket.emit('leave_board_room', { boardId });
    }
  }
}

// Example usage
async function example() {
  const client = new AISocketClient('http://localhost:3001', 'your-jwt-token');
  
  try {
    // Connect to AI socket
    client.connect();
    
    // Wait for connection
    await new Promise(resolve => {
      client.socket.on('connect', resolve);
    });

    console.log('🚀 Testing AI Socket Functionality...\n');

    // Test 1: Generate board
    console.log('📋 Testing board generation...');
    try {
      const board = await client.generateBoard(
        'Create a project management board for a web development project',
        { includeChecklists: true, includeTags: true }
      );
      console.log('✅ Board generated:', board.board.name);
      console.log(`   Columns: ${board.columns.length}, Tasks: ${board.tasks.length}, Tags: ${board.tags.length}\n`);
    } catch (error) {
      console.error('❌ Board generation failed:', error.message);
    }

    // Test 2: Auto-complete prompt
    console.log('🔤 Testing auto-completion...');
    try {
      const suggestions = await client.autoCompletePrompt(
        'Create a project management board for',
        { category: 'development', teamSize: 'small' }
      );
      console.log('✅ Auto-completion suggestions:', suggestions.suggestions.length);
      suggestions.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.prompt.substring(0, 60)}...`);
      });
      console.log();
    } catch (error) {
      console.error('❌ Auto-completion failed:', error.message);
    }

    // Test 3: Get smart suggestions
    console.log('🧠 Testing smart suggestions...');
    try {
      const suggestions = await client.getSmartSuggestions('content creation workflow');
      console.log('✅ Smart suggestions received:');
      console.log(`   Board types: ${suggestions.boardTypes.length}`);
      console.log(`   Templates: ${suggestions.templates.length}`);
      console.log(`   Features: ${suggestions.features.length}`);
      console.log(`   Columns: ${suggestions.columns.length}`);
      console.log(`   Tags: ${suggestions.tags.length}\n`);
    } catch (error) {
      console.error('❌ Smart suggestions failed:', error.message);
    }

    // Test 4: Get quick templates
    console.log('⚡ Testing quick templates...');
    try {
      const templates = await client.getQuickTemplates('development', 3);
      console.log('✅ Quick templates received:', templates.length);
      templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.boardType})`);
      });
      console.log();
    } catch (error) {
      console.error('❌ Quick templates failed:', error.message);
    }

    // Test 5: Get model info
    console.log('📊 Testing model info...');
    try {
      const modelInfo = await client.getModelInfo();
      console.log('✅ Model info received:');
      console.log(`   Available: ${modelInfo.available}`);
      console.log(`   Features: ${modelInfo.features.join(', ')}\n`);
    } catch (error) {
      console.error('❌ Model info failed:', error.message);
    }

    // Test 6: Content moderation
    console.log('🛡️ Testing content moderation...');
    try {
      const moderation = await client.moderateContent('This is a test message for content moderation');
      console.log('✅ Content moderation result:');
      console.log(`   Flagged: ${moderation.flagged}`);
      console.log(`   Categories: ${moderation.categories.join(', ')}\n`);
    } catch (error) {
      console.error('❌ Content moderation failed:', error.message);
    }

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Example failed:', error);
  } finally {
    // Disconnect
    client.disconnect();
    console.log('👋 Disconnected from AI socket');
  }
}

// Export for use in other files
module.exports = {
  AISocketClient,
  example
};

// Run example if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
}
