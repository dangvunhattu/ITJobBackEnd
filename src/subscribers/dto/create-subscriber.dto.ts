import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: 'Skills không được để trống' })
    @ArrayMinSize(1)
    @IsArray({ message: 'Skills có định dạng là array' })
    // "each" tells class validator to run the validation on each line of the array
    @IsString({ each: true, message: 'Skills định dạng là string' })
    skills: string;
}
