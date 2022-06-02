import { DataTypes, Model } from "../deps.ts";

export type TaskModel = {
  id: number;
  title: string;
  description: string;
  priority: 0 | 1 | 2 | 3 | 4;
  startDate: Date | null;
  endDate: Date | null;
  completionDate: Date | null;

  /**
   * CRON string
   *
   * e.g: '* * * * *'
   */
  repeat: string;

  /**
   * Repeat from which date
   */
  repeatType: "endDate" | "completionDate";

  /**
   * timestamp default fields
   */
  createdAt: Date;
  /**
   * timestamp default fields
   */
  updatedAt: Date;
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
    repeatType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "completionDate",
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
