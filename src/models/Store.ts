import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.ts";
import { User } from "./User.ts";

export class Store extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public address!: string;
  public ownerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "owner_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "stores",
    timestamps: true,
  }
);

// Setup associations
User.hasOne(Store, { foreignKey: "ownerId", as: "store" });
Store.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
