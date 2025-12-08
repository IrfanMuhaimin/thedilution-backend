// models/jobcard.model.js

module.exports = (sequelize, DataTypes) => {
  const Jobcard = sequelize.define("Jobcard", {
    jobcardId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // --- NEW FIELD ADDED ---
    hardwareId: {
      type: DataTypes.INTEGER,
      allowNull: true, // A jobcard can be created without a machine assigned yet
      references: {
        model: 'Hardware',
        key: 'hardwareId'
      }
    },
    // --- END OF NEW FIELD ---
    dilutionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Dilutions',
        key: 'dilutionId'
      }
    },
    prescriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PrescriptionDetails',
        key: 'prescriptionId'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      }
    },
    approvedByUserId: {
      type: DataTypes.INTEGER
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    emergencyLevel: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requestDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    approveDate: {
      type: DataTypes.DATE
    }
  }, { timestamps: false,
     hooks: {
      afterDestroy: async (jobcard, options) => {
        if (jobcard.prescriptionId) {
          const PrescriptionDetailModel = sequelize.models.PrescriptionDetail;
          await PrescriptionDetailModel.destroy({
            where: { prescriptionId: jobcard.prescriptionId },
            transaction: options.transaction
          });
        }
      }
    }
   });

  return Jobcard;
};