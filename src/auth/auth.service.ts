import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Types } from "mongoose";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    const isMatch = await bcrypt.compare(password, user?.password);
    if (isMatch) {
      return user;
    }
    return null;
  }
  async validateUserById(id: string): Promise<any> {
    const user = await this.userService.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
  async getJwtToken(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: "",
    };
  }

  async create(createAuthDto: CreateAuthDto) {
    const user = await this.userService.findOneByEmail(createAuthDto?.email);
    if (user) throw new HttpException("Email address already exists!", 400);
    const salt = this.configService.get("HASH_SALT");
    const hash = await bcrypt.hash(createAuthDto?.password, salt);

    return this.userService.create({ ...createAuthDto, password: hash });
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
