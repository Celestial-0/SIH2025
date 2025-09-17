import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for instance methods
interface IUserMethods {
  hasExceededAPILimit(apiType: 'cropRecommendations' | 'imageProcessing' | 'chatMessages'): boolean;
  incrementAPIUsage(apiType: 'cropRecommendations' | 'imageProcessing' | 'chatMessages'): void;
}

// Interface for static methods
interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByLocation(state: string, district?: string): Promise<IUser[]>;
  findByCrop(crop: string): Promise<IUser[]>;
}

// Interface for User document
export interface IUser extends Document, IUserMethods {
  // Basic Authentication
  email: string;
  password: string;
  username: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  
  // Agricultural Profile
  farmerType: 'individual' | 'commercial' | 'cooperative' | 'research';
  farmSize?: number; // in acres/hectares
  primaryCrops?: string[];
  farmLocation?: {
    state: string;
    district: string;
    pincode: string;
    village?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Experience and Education
  farmingExperience?: number; // years
  educationLevel?: 'none' | 'primary' | 'secondary' | 'graduate' | 'postgraduate';
  preferredLanguage: string;
  
  // AI/ML Interaction History
  cropRecommendations: {
    requestId: string;
    date: Date;
    soilData: {
      nitrogen?: number;
      phosphorus?: number;
      potassium?: number;
      ph?: number;
      organic_carbon?: number;
      moisture?: number;
    };
    environmentalData: {
      temperature?: number;
      humidity?: number;
      rainfall?: number;
      season?: string;
    };
    recommendedCrops: string[];
    confidence: number;
    feedback?: 'helpful' | 'not_helpful' | 'partially_helpful';
  }[];
  
  imageProcessingHistory: {
    requestId: string;
    date: Date;
    imageUrl: string;
    analysisType: 'disease_detection' | 'pest_identification' | 'crop_health' | 'yield_estimation';
    results: {
      detected_issues?: string[];
      confidence: number;
      recommendations?: string[];
      severity?: 'low' | 'medium' | 'high';
    };
    feedback?: 'accurate' | 'inaccurate' | 'partially_accurate';
  }[];
  
  // Chat/Support History
  chatSessions: {
    sessionId: string;
    startDate: Date;
    endDate?: Date;
    messageCount: number;
    topics: string[];
    satisfaction?: number; // 1-5 rating
  }[];
  
  // IoT/Sensor Data (ESP32 integration)
  sensorDevices: {
    deviceId: string;
    deviceName: string;
    installationDate: Date;
    location: string;
    isActive: boolean;
    lastDataReceived?: Date;
  }[];
  
  sensorReadings: {
    deviceId: string;
    timestamp: Date;
    data: {
      soilMoisture?: number;
      soilTemperature?: number;
      airTemperature?: number;
      humidity?: number;
      lightIntensity?: number;
      ph?: number;
      nutrients?: {
        nitrogen?: number;
        phosphorus?: number;
        potassium?: number;
      };
    };
  }[];
  
  // Preferences and Settings
  preferences: {
    units: 'metric' | 'imperial';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      weatherAlerts: boolean;
      cropRecommendations: boolean;
      marketPrices: boolean;
    };
    dataSharing: {
      researchPurposes: boolean;
      governmentSchemes: boolean;
      marketAnalytics: boolean;
    };
  };
  
  // Subscription and Access
  subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: Date;
  apiUsage: {
    month: string; // YYYY-MM
    cropRecommendations: number;
    imageProcessing: number;
    chatMessages: number;
    maxLimits: {
      cropRecommendations: number;
      imageProcessing: number;
      chatMessages: number;
    };
  }[];
  
  // Verification and Trust
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFarmerVerified: boolean; // Government/authority verification
  verificationDocuments?: {
    type: 'land_record' | 'farmer_id' | 'cooperative_membership';
    documentUrl: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    uploadDate: Date;
  }[];
  
  // Security and Session Management
  lastLogin?: Date;
  loginHistory: {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    location?: string;
  }[];
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  
  // Account Management
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  fullName: string;
  currentApiUsage: {
    month: string;
    cropRecommendations: number;
    imageProcessing: number;
    chatMessages: number;
    maxLimits: {
      cropRecommendations: number;
      imageProcessing: number;
      chatMessages: number;
    };
  };
}

// User Schema Definition
const userSchema = new Schema<IUser>({
  // Basic Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  dateOfBirth: {
    type: Date
  },
  
  // Agricultural Profile
  farmerType: {
    type: String,
    enum: ['individual', 'commercial', 'cooperative', 'research'],
    required: true,
    default: 'individual'
  },
  farmSize: {
    type: Number,
    min: 0
  },
  primaryCrops: [{
    type: String,
    trim: true
  }],
  farmLocation: {
    state: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Experience and Education
  farmingExperience: {
    type: Number,
    min: 0,
    max: 100
  },
  educationLevel: {
    type: String,
    enum: ['none', 'primary', 'secondary', 'graduate', 'postgraduate']
  },
  preferredLanguage: {
    type: String,
    required: true,
    default: 'en'
  },
  
  // AI/ML Interaction History
  cropRecommendations: [{
    requestId: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    soilData: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      ph: Number,
      organic_carbon: Number,
      moisture: Number
    },
    environmentalData: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      season: String
    },
    recommendedCrops: [{
      type: String
    }],
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    feedback: {
      type: String,
      enum: ['helpful', 'not_helpful', 'partially_helpful']
    }
  }],
  
  imageProcessingHistory: [{
    requestId: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    imageUrl: {
      type: String,
      required: true
    },
    analysisType: {
      type: String,
      enum: ['disease_detection', 'pest_identification', 'crop_health', 'yield_estimation'],
      required: true
    },
    results: {
      detected_issues: [String],
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      recommendations: [String],
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    feedback: {
      type: String,
      enum: ['accurate', 'inaccurate', 'partially_accurate']
    }
  }],
  
  // Chat/Support History
  chatSessions: [{
    sessionId: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    messageCount: {
      type: Number,
      default: 0
    },
    topics: [String],
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // IoT/Sensor Data
  sensorDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceName: {
      type: String,
      required: true
    },
    installationDate: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastDataReceived: Date
  }],
  
  sensorReadings: [{
    deviceId: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      soilMoisture: Number,
      soilTemperature: Number,
      airTemperature: Number,
      humidity: Number,
      lightIntensity: Number,
      ph: Number,
      nutrients: {
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number
      }
    }
  }],
  
  // Preferences and Settings
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      weatherAlerts: {
        type: Boolean,
        default: true
      },
      cropRecommendations: {
        type: Boolean,
        default: true
      },
      marketPrices: {
        type: Boolean,
        default: false
      }
    },
    dataSharing: {
      researchPurposes: {
        type: Boolean,
        default: false
      },
      governmentSchemes: {
        type: Boolean,
        default: false
      },
      marketAnalytics: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Subscription and Access
  subscriptionType: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  apiUsage: [{
    month: {
      type: String,
      required: true // Format: YYYY-MM
    },
    cropRecommendations: {
      type: Number,
      default: 0
    },
    imageProcessing: {
      type: Number,
      default: 0
    },
    chatMessages: {
      type: Number,
      default: 0
    },
    maxLimits: {
      cropRecommendations: {
        type: Number,
        default: 10 // Free tier limit
      },
      imageProcessing: {
        type: Number,
        default: 5 // Free tier limit
      },
      chatMessages: {
        type: Number,
        default: 50 // Free tier limit
      }
    }
  }],
  
  // Verification and Trust
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isFarmerVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['land_record', 'farmer_id', 'cooperative_membership'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security and Session Management
  lastLogin: Date,
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    },
    location: String
  }],
  refreshTokens: [{
    type: String
  }],
  passwordResetToken: String,
  passwordResetExpiry: Date,
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  
  // Account Management
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  collection: 'users'
});

// Indexes for better query performance
userSchema.index({ 'farmLocation.state': 1, 'farmLocation.district': 1 });
userSchema.index({ farmerType: 1 });
userSchema.index({ subscriptionType: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

// Compound indexes for common queries
userSchema.index({ email: 1, isActive: 1, isDeleted: 1 });
userSchema.index({ 'farmLocation.state': 1, 'farmLocation.district': 1, farmerType: 1 });
userSchema.index({ subscriptionType: 1, 'apiUsage.month': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for current month API usage
userSchema.virtual('currentApiUsage').get(function() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  return this.apiUsage.find(usage => usage.month === currentMonth) || {
    month: currentMonth,
    cropRecommendations: 0,
    imageProcessing: 0,
    chatMessages: 0,
    maxLimits: {
      cropRecommendations: this.subscriptionType === 'free' ? 10 : 
                          this.subscriptionType === 'basic' ? 50 : 
                          this.subscriptionType === 'premium' ? 200 : 1000,
      imageProcessing: this.subscriptionType === 'free' ? 5 : 
                      this.subscriptionType === 'basic' ? 25 : 
                      this.subscriptionType === 'premium' ? 100 : 500,
      chatMessages: this.subscriptionType === 'free' ? 50 : 
                   this.subscriptionType === 'basic' ? 200 : 
                   this.subscriptionType === 'premium' ? 1000 : 5000
    }
  };
});

// Pre-save middleware to hash password (you'll need to implement this)
userSchema.pre('save', function(next) {
  // Password hashing logic will go here
  // Example: if (this.isModified('password')) { /* hash password */ }
  next();
});

// Method to check if user has exceeded API limits
userSchema.methods['hasExceededAPILimit'] = function(this: IUser, apiType: 'cropRecommendations' | 'imageProcessing' | 'chatMessages'): boolean {
  const currentUsage = this.currentApiUsage;
  return currentUsage[apiType] >= currentUsage.maxLimits[apiType];
};

// Method to increment API usage
userSchema.methods['incrementAPIUsage'] = function(this: IUser, apiType: 'cropRecommendations' | 'imageProcessing' | 'chatMessages'): void {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usageIndex = this.apiUsage.findIndex((usage: any) => usage.month === currentMonth);
  
  if (usageIndex === -1) {
    // Create new month entry
    this.apiUsage.push({
      month: currentMonth,
      cropRecommendations: apiType === 'cropRecommendations' ? 1 : 0,
      imageProcessing: apiType === 'imageProcessing' ? 1 : 0,
      chatMessages: apiType === 'chatMessages' ? 1 : 0,
      maxLimits: this.currentApiUsage.maxLimits
    });
  } else {
    // Increment existing month entry
    this.apiUsage[usageIndex][apiType]++;
  }
};

// Static method to find farmers by location
userSchema.statics['findByLocation'] = function(state: string, district?: string) {
  const query: any = { 'farmLocation.state': state, isActive: true, isDeleted: false };
  if (district) {
    query['farmLocation.district'] = district;
  }
  return this.find(query);
};

// Static method to find farmers by crop
userSchema.statics['findByCrop'] = function(crop: string) {
  return this.find({ 
    primaryCrops: { $in: [crop] }, 
    isActive: true, 
    isDeleted: false 
  });
};

// Create and export the model
const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;