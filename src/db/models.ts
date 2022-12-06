import { DataTypes, Model, Relationships } from "../deps.ts";

export type TaskModel = {
  id: number;
  title: string;
  description: string;
  priority: 0 | 1 | 2;
  startDate: Date | null;
  endDate: Date | null;
  completionDate: Date | null;

  /**
   * CRON string or custom repeat pattern
   *
   * If 'repeatType' is 'endDate' then a "CRON string" is expected.
   * - should be expressed in local time (JST)
   * - e.g: '* * * * *'
   *
   * If 'repeatType' is 'completionDate' then a "repeat pattern" is expected.
   * - "${Multiplier}${Duration}"
   * - e.g. "D14" (after 14 Days)
   * - e.g. "H10" (after 10 Hours)
   */
  repeat: string;

  /**
   * Repeat from which date
   * - "endDate" is suitable for fixed dates, such as birthdays and regular events
   * - "completionDate" is suitable for chores
   */
  repeatType: "endDate" | "completionDate";

  tags: TagModel[];

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

  static tags() {
    return this.hasMany(Tag);
  }
}

export type TagModel = {
  id: number;
  name: string;
  bgColor: string;
  textColor: string;

  /**
   * timestamp default fields
   */
  createdAt: Date;
  /**
   * timestamp default fields
   */
  updatedAt: Date;
};

export class Tag extends Model {
  static table = "tag";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bgColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    textColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };

  static tasks() {
    return this.hasMany(Task);
  }
}

export const TagTask = Relationships.manyToMany(Tag, Task);
