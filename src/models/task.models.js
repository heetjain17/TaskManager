import mongoose, {Schema} from 'mongoose'
import {AvialableTaskStatuses} from '../utils/constants.js'
const taskSchema =  new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    project:{
        type: Schema.Types.ObjectId,
        re: "Project",
        required: true,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: AvialableTaskStatuses,
        default: AvialableTaskStatuses[0]
    },
    attachments: {
        type: [
            {
                url: String,
                mimetype: String,
                size: Number,
            }
        ],
        default: [], 
    }
}, {timestamps: true});

export const Task = mongoose.model('Task', taskSchema);