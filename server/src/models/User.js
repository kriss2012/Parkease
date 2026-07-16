const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['admin', 'owner', 'guard', 'user'],
      default: 'user',
    },
    // Owner-specific
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'owner' ? 'pending' : 'approved';
      },
    },
    // Guard-specific: which mall they are assigned to
    assignedMall: { type: mongoose.Schema.Types.ObjectId, ref: 'Mall' },
    favoriteMalls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mall' }],
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    avatar: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
