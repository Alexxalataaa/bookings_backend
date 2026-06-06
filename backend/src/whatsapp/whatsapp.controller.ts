import { Controller, Get, Post, Body, Query, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /** Meta webhook verification (GET) */
  @Get('webhook')
  @ApiOperation({ summary: 'WhatsApp webhook verification (Meta handshake)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: any,
  ) {
    const result = this.whatsappService.verifyWebhook(mode, token, challenge);
    if (result !== null) {
      return res.status(200).send(result);
    }
    return res.status(403).send('Forbidden');
  }

  /** Receive real WhatsApp messages from Meta Cloud API */
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive incoming WhatsApp messages from Meta' })
  async receiveMessage(@Body() body: any): Promise<{ status: string }> {
    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (!message || message.type !== 'text') {
        return { status: 'ignored' };
      }

      const phoneNumber = message.from;
      const text: string = message.text?.body || '';

      await this.whatsappService.processMessage(phoneNumber, text);
      // Note: In production, you would send the reply back via Meta API here
      // using fetch to POST to https://graph.facebook.com/v18.0/{phone_id}/messages

      return { status: 'received' };
    } catch {
      return { status: 'error' };
    }
  }

  /** Internal simulate endpoint — used by the admin panel simulator */
  @Post('simulate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Simulate a WhatsApp conversation (admin panel demo)' })
  async simulate(
    @Body() body: { phoneNumber: string; message: string },
  ): Promise<{ reply: string }> {
    const reply = await this.whatsappService.processMessage(
      body.phoneNumber || 'simulator_demo',
      body.message,
    );
    return { reply };
  }

  /** Get active sessions for admin panel */
  @Get('sessions')
  @ApiOperation({ summary: 'Get active WhatsApp conversation sessions (admin)' })
  getSessions(): any[] {
    return this.whatsappService.getActiveSessions();
  }
}
