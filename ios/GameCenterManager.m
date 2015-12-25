//
//  GameCenterManager.m
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "GameCenterManager.h"
#import "AppDelegate.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
@import GameKit;

@implementation GameCenterManager

@synthesize bridge = _bridge;

//int RCTLogInfo(NSString *message);

RCT_EXPORT_MODULE();

//RCT_EXPORT_METHOD(newMatch:(NSString *)name location:(NSString *)location)

RCT_EXPORT_METHOD(newMatch)
{
  //TODO: Handle non-logged in players.
  //NSLog(@"Pretending to create an event %@ at %@", name, location);
  NSLog(@"Loading GK Matchmaker view");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                    [[UIApplication sharedApplication]delegate] window] rootViewController];
  
  GKMatchRequest *request = [[GKMatchRequest alloc] init];
  request.minPlayers = 2;
  request.maxPlayers = 2;
  
  GKTurnBasedMatchmakerViewController *mmvc = [[GKTurnBasedMatchmakerViewController alloc] initWithMatchRequest:request];
  mmvc.turnBasedMatchmakerDelegate = self;
  
  [rootController presentViewController:mmvc animated:YES completion:nil];
}

RCT_EXPORT_METHOD(endTurnWithNextParticipants:(NSString *)game)
{
  NSLog(@"End turn with next participants");
  
  NSLog(@"participants[0] ID: %@", self.currentMatch.participants[0].playerID);
  NSLog(@"participants[1] ID: %@", self.currentMatch.participants[1].playerID);
  NSLog(@"currentParticipant ID: %@", self.currentMatch.currentParticipant.playerID);
  
  NSArray* nextPlayer;
  
  if (self.currentMatch.currentParticipant.playerID == self.currentMatch.participants[0].playerID)
  {
    nextPlayer = @[self.currentMatch.participants[1]];
  } else {
    nextPlayer = @[self.currentMatch.participants[0]];
  }
  
  NSData * updatedMatchData = [game dataUsingEncoding:NSUTF8StringEncoding]; //Data
  //NSArray* sortedPlayerOrder = [[self.currentMatch.participants reverseObjectEnumerator] allObjects];
  [self.currentMatch endTurnWithNextParticipants:nextPlayer turnTimeout:GKTurnTimeoutDefault matchData:updatedMatchData completionHandler: ^(NSError *error) {
    if (error)
    {
      // Handle the error.
    }
  }];
}

#pragma mark GKTurnBasedMatchmakerViewControllerDelegate

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFindMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"didFindMatch");
  self.currentMatch = match;
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
  NSLog(@"participants[0] ID: %@", match.participants[0].playerID);
  NSLog(@"participants[1] ID: %@", match.participants[1].playerID);
  NSLog(@"currentParticipant ID: %@", match.currentParticipant.playerID);
  NSLog(@"localPlayer ID: %@", localPlayer.playerID);
  NSString* matchData;
  if (match.matchData.length == 0)
  {
    matchData = @"";
  } else {
    matchData = [NSString stringWithUTF8String:[match.matchData bytes]];
  }
  NSDictionary *event = @{
    @"match": @{
//      @"creationDate": [NSNumber numberWithDouble:[match.creationDate timeIntervalSinceReferenceDate]],
      @"matchID": match.matchID,
      @"yourTurn": match.currentParticipant.player == localPlayer ? @(YES) : @(NO),
      @"newMatch": match.matchData.length == 0 ? @(YES) : @(NO),
      @"matchData": matchData,
//      @"message": match.message,
//      @"currentParticipant": match.currentParticipant.player.playerID,
    }
  };
  [rootController dismissViewControllerAnimated:YES completion:nil];
  [_bridge.eventDispatcher sendAppEventWithName:@"didFindMatch" body:event];
  
//  [match removeWithCompletionHandler:^(NSError *error) {
//    
//  }];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController playerQuitForMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"PlayerQuitForMatch");
  [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFailWithError:(nonnull NSError *)error
{
  NSLog(@"didFailWithError");
  NSLog(@"%@", error);
  [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewControllerWasCancelled:(GKTurnBasedMatchmakerViewController *)viewController {
  NSLog(@"WasCancelled");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}


@end
