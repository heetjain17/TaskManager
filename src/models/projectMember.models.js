import mongoose, { Schema} from 'mongoose'
import {AvialableUserRoles} from '../utils/constants.js'

const projectMemeberSchema =  new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,    
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    role:{
        type: String,
        enum: AvialableUserRoles,
        default: AvialableUserRoles[2],
    }
}, {timeseries: true});

export const ProjectMember = mongoose.model('ProjectMember', projectMemeberSchema);