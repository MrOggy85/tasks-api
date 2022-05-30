import { DataTypes, Model } from "../deps.ts";

export type TaskModel = {
  id: number;
  title: string;
  description: string;
  priority: 0 | 1 | 2 | 3 | 4;
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  repeat: string;
};

export class Task extends Model {
  static table = "task";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    repeat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATETIME,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATETIME,
      allowNull: true,
    },
    completionDate: {
      type: DataTypes.DATETIME,
      allowNull: true,
    },
  };
}
