import instance from '../lib/filedb';
import * as Sequelize from 'sequelize';

const umodel = instance.define('mediafiles',{
    UUID: {
      type: Sequelize.INTEGER,
      primaryKey: true, 
      autoIncrement: true,
    },
    
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'empty name do\'nt allowed'
            }
        },
    },
    
    time: {
        type: Sequelize.STRING,
        defaultValue: '1970-01-01T00:00:00Z',// ISO 8601
    }, 
    
    description: {
        type: Sequelize.STRING,
        defaultValue: 'N/A',
    },
    
    passwd: {
        type: Sequelize.STRING, // password (sha-256) 
        unique: true,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'empty password do\'nt allowed'
            }
        }
    },
    
    stuid: {
        type: Sequelize.STRING,
        unique: true,
        defaultValue: 'N/A',
    }
});

export default umodel;
