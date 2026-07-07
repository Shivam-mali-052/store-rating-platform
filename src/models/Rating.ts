import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.ts";
import { User } from "./User.ts";
import { Store } from "./Store.ts";

export class Rating extends Model {
  public id!: number;
  public userId!: number;
  public storeId!: number;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "store_id",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
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
    tableName: "ratings",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "store_id"],
      },
    ],
  }
);

// Setup associations
User.hasMany(Rating, { foreignKey: "userId", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "userId", as: "user" });

Store.hasMany(Rating, { foreignKey: "storeId", as: "ratings" });
Rating.belongsTo(Store, { foreignKey: "storeId", as: "store" });
