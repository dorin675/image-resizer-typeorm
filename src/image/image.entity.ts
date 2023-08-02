import { User } from 'src/users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  name: string;

  @Column()
  mimeType: string;

  @Column()
  extension: string;

  @Column()
  type: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  quality: number;

  @Column({ type: 'bytea', nullable: false })
  buffer: Buffer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMPT' })
  time: string;

  @ManyToOne(() => User, (user) => user.images)
  user: User;
}
