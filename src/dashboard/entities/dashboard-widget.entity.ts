import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum WidgetType {
  COUNTER = 'counter',
  CHART_LINE = 'chart_line',
  CHART_BAR = 'chart_bar',
  CHART_PIE = 'chart_pie',
  CHART_DOUGHNUT = 'chart_doughnut',
  TABLE = 'table',
  LIST = 'list',
  PROGRESS = 'progress',
  CALENDAR = 'calendar',
  MAP = 'map',
  ACTIVITY_FEED = 'activity_feed',
  STAT_CARD = 'stat_card',
}

export enum WidgetSize {
  SMALL = 'small', // 1x1
  MEDIUM = 'medium', // 2x1
  LARGE = 'large', // 2x2
  WIDE = 'wide', // 3x1
  EXTRA_LARGE = 'extra_large', // 3x2
  FULL_WIDTH = 'full_width', // 4x1
}

@Entity('dashboard_widgets')
@Index(['userId', 'isActive'])
@Index(['type', 'isActive'])
export class DashboardWidget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WidgetType,
  })
  type: WidgetType;

  @Column({
    type: 'enum',
    enum: WidgetSize,
    default: WidgetSize.MEDIUM,
  })
  size: WidgetSize;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'int', default: 0 })
  row: number;

  @Column({ type: 'int', default: 0 })
  column: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  dataSource: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  refreshInterval: string; // '5m', '1h', '1d', etc.

  @Column({ type: 'timestamp', nullable: true })
  lastRefreshedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subcategory: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ type: 'json', nullable: true })
  styling: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
