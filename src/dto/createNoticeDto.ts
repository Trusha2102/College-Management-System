// import { IsArray, IsNotEmpty, IsString, IsDate } from 'class-validator';
// import { Transform, Type } from 'class-transformer';

// export class CreateNoticeDto {
//   @IsNotEmpty()
//   @IsString()
//   title!: string;

//   @IsNotEmpty()
//   @IsDate()
//   noticeDate!: Date;

//   @IsNotEmpty()
//   @IsDate()
//   publishOn!: Date;

//   @IsNotEmpty()
//   @IsArray()
//   @Transform(({ value }) => JSON.parse(value))
//   @Type(() => String)
//   messageTo!: string[];

//   @IsNotEmpty()
//   @IsString()
//   message!: string;
// }
